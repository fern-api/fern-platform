import { addHours, subHours } from "date-fns";
import { uniqueId } from "es-toolkit/compat";

import { createMockFdrApplication } from "../mock";
import { prisma } from "./setupMockFdr";
import {
  createMockDocs,
  createMockIndexSegment,
  getUniqueDocsForUrl,
} from "./util";

function getUniqueSegment(): string {
  return `seg_${Math.random()}`;
}

const fdrApplication = createMockFdrApplication({
  orgIds: ["acme", "octoai"],
});

describe("algolia index segment deleter", () => {
  it("correctly deletes old inactive index segments for unversioned docs", async () => {
    const domain = getUniqueDocsForUrl("algolia");
    const path = "abc";

    // Index segments that were deleted before this date are considered "dated" or "old"
    // Fern only deletes old segments that are not referenced by any docs
    const olderThanHours = 24;
    const oldSegmentCutoffDate = subHours(new Date(), olderThanHours);

    console.log(uniqueId("seg"));

    const inactiveOldIndexSegments = [
      createMockIndexSegment({
        id: getUniqueSegment(),
        createdAt: subHours(oldSegmentCutoffDate, 4),
      }),
      createMockIndexSegment({
        id: getUniqueSegment(),
        createdAt: subHours(oldSegmentCutoffDate, 3),
      }),
      createMockIndexSegment({
        id: getUniqueSegment(),
        createdAt: subHours(oldSegmentCutoffDate, 2),
      }),
      createMockIndexSegment({
        id: getUniqueSegment(),
        createdAt: subHours(oldSegmentCutoffDate, 1),
      }),
    ];
    const activeIndexSegments = [
      createMockIndexSegment({
        id: getUniqueSegment(),
        createdAt: addHours(oldSegmentCutoffDate, 1),
      }),
    ];
    const docsV2 = createMockDocs({
      domain,
      path,
      indexSegmentIds: activeIndexSegments.map((s) => s.id),
    });

    await prisma.$transaction(async (tx) => {
      await tx.docsV2.create({
        data: {
          ...docsV2,
          indexSegmentIds: docsV2.indexSegmentIds as string[],
        },
      });
      const allIndexSegments = [
        ...inactiveOldIndexSegments,
        ...activeIndexSegments,
      ];
      await Promise.all(
        allIndexSegments.map((seg) => tx.indexSegment.create({ data: seg }))
      );
    });

    await fdrApplication.services.algoliaIndexSegmentDeleter.deleteOldInactiveIndexSegments(
      {
        olderThanHours,
      }
    );

    const newIndexSegmentRecords = await prisma.indexSegment.findMany({
      select: { id: true },
    });

    const newIndexSegmentRecordIds = new Set(
      newIndexSegmentRecords.map((r) => r.id)
    );

    // Expect inactive old segments to be deleted
    inactiveOldIndexSegments.forEach((s) => {
      expect(newIndexSegmentRecordIds.has(s.id)).toBe(false);
    });

    // Expect active segments to remain
    activeIndexSegments.forEach((s) => {
      expect(newIndexSegmentRecordIds.has(s.id)).toBe(true);
    });
  });
});
