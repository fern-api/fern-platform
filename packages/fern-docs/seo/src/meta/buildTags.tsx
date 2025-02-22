import { ReactNode } from "react";
import { NextSeoProps, OpenGraphMedia } from "../types";

const buildOpenGraphMediaTags = (
  mediaType: "image" | "video" | "audio",
  media: readonly OpenGraphMedia[] = [],
  {
    defaultWidth,
    defaultHeight,
  }: { defaultWidth?: number; defaultHeight?: number } = {}
) => {
  return media.reduce<ReactNode[]>((tags, medium, index) => {
    tags.push(
      <meta
        key={`og:${mediaType}:0${index}`}
        property={`og:${mediaType}`}
        content={medium.url}
      />
    );

    if (medium.alt) {
      tags.push(
        <meta
          key={`og:${mediaType}:alt0${index}`}
          property={`og:${mediaType}:alt`}
          content={medium.alt}
        />
      );
    }

    if (medium.secureUrl) {
      tags.push(
        <meta
          key={`og:${mediaType}:secure_url0${index}`}
          property={`og:${mediaType}:secure_url`}
          content={medium.secureUrl.toString()}
        />
      );
    }

    if (medium.type) {
      tags.push(
        <meta
          key={`og:${mediaType}:type0${index}`}
          property={`og:${mediaType}:type`}
          content={medium.type.toString()}
        />
      );
    }

    if (medium.width) {
      tags.push(
        <meta
          key={`og:${mediaType}:width0${index}`}
          property={`og:${mediaType}:width`}
          content={medium.width.toString()}
        />
      );
    } else if (defaultWidth) {
      tags.push(
        <meta
          key={`og:${mediaType}:width0${index}`}
          property={`og:${mediaType}:width`}
          content={defaultWidth.toString()}
        />
      );
    }

    if (medium.height) {
      tags.push(
        <meta
          key={`og:${mediaType}:height${index}`}
          property={`og:${mediaType}:height`}
          content={medium.height.toString()}
        />
      );
    } else if (defaultHeight) {
      tags.push(
        <meta
          key={`og:${mediaType}:height${index}`}
          property={`og:${mediaType}:height`}
          content={defaultHeight.toString()}
        />
      );
    }

    return tags;
  }, []);
};

export const buildTags = (config: NextSeoProps): ReactNode[] => {
  const tagsToRender: ReactNode[] = [];

  if (config.viewport != null) {
    tagsToRender.push(
      <meta key="viewport" name="viewport" content={config.viewport} />
    );
  }

  let updatedTitle = "";
  if (config.title) {
    updatedTitle = config.title;
    if (config.titleTemplate) {
      updatedTitle = config.titleTemplate.replace(/%s/g, () => updatedTitle);
    }
  }

  tagsToRender.push(<title key="title">{updatedTitle}</title>);

  const noindex = config.noindex ?? false;
  const nofollow = config.nofollow ?? false;
  const norobots = config.norobots ?? false;

  let robotsParams = "";

  if (config.robotsProps) {
    const {
      nosnippet,
      maxSnippet,
      maxImagePreview,
      maxVideoPreview,
      noarchive,
      noimageindex,
      notranslate,
      unavailableAfter,
    } = config.robotsProps;

    robotsParams = `${nosnippet ? ",nosnippet" : ""}${
      maxSnippet ? `,max-snippet:${maxSnippet}` : ""
    }${maxImagePreview ? `,max-image-preview:${maxImagePreview}` : ""}${
      noarchive ? ",noarchive" : ""
    }${unavailableAfter ? `,unavailable_after:${unavailableAfter}` : ""}${
      noimageindex ? ",noimageindex" : ""
    }${maxVideoPreview ? `,max-video-preview:${maxVideoPreview}` : ""}${notranslate ? ",notranslate" : ""}`;
  }

  if (noindex || nofollow) {
    tagsToRender.push(
      <meta
        key="robots"
        name="robots"
        content={`${noindex ? "noindex" : "index"},${nofollow ? "nofollow" : "follow"}${robotsParams}`}
      />
    );
  } else if (!norobots || robotsParams) {
    tagsToRender.push(
      <meta
        key="robots"
        name="robots"
        content={`index,follow${robotsParams}`}
      />
    );
  }

  if (config.description) {
    tagsToRender.push(
      <meta key="description" name="description" content={config.description} />
    );
  }

  if (config.themeColor) {
    tagsToRender.push(
      <meta key="theme-color" name="theme-color" content={config.themeColor} />
    );
  }

  if (config.mobileAlternate) {
    tagsToRender.push(
      <link
        rel="alternate"
        key="mobileAlternate"
        media={config.mobileAlternate.media}
        href={config.mobileAlternate.href}
      />
    );
  }

  if (config.languageAlternates && config.languageAlternates.length > 0) {
    config.languageAlternates.forEach((languageAlternate) => {
      tagsToRender.push(
        <link
          rel="alternate"
          key={`languageAlternate-${languageAlternate.hrefLang}`}
          hrefLang={languageAlternate.hrefLang}
          href={languageAlternate.href}
        />
      );
    });
  }

  if (config.twitter) {
    if (config.twitter.cardType) {
      tagsToRender.push(
        <meta
          key="twitter:card"
          name="twitter:card"
          content={config.twitter.cardType}
        />
      );
    }

    if (config.twitter.site) {
      tagsToRender.push(
        <meta
          key="twitter:site"
          name="twitter:site"
          content={config.twitter.site}
        />
      );
    }

    if (config.twitter.handle) {
      tagsToRender.push(
        <meta
          key="twitter:creator"
          name="twitter:creator"
          content={config.twitter.handle}
        />
      );
    }
  }

  if (config.facebook) {
    if (config.facebook.appId) {
      tagsToRender.push(
        <meta
          key="fb:app_id"
          property="fb:app_id"
          content={config.facebook.appId}
        />
      );
    }
  }

  if (config.openGraph?.title || updatedTitle) {
    tagsToRender.push(
      <meta
        key="og:title"
        property="og:title"
        content={config.openGraph?.title || updatedTitle}
      />
    );
  }

  if (config.openGraph?.description || config.description) {
    tagsToRender.push(
      <meta
        key="og:description"
        property="og:description"
        content={config.openGraph?.description || config.description}
      />
    );
  }

  if (config.openGraph) {
    if (config.openGraph.url || config.canonical) {
      tagsToRender.push(
        <meta
          key="og:url"
          property="og:url"
          content={config.openGraph.url || config.canonical}
        />
      );
    }

    if (config.openGraph.type) {
      const type = config.openGraph.type.toLowerCase();

      tagsToRender.push(
        <meta key="og:type" property="og:type" content={type} />
      );

      if (type === "profile" && config.openGraph.profile) {
        if (config.openGraph.profile.firstName) {
          tagsToRender.push(
            <meta
              key="profile:first_name"
              property="profile:first_name"
              content={config.openGraph.profile.firstName}
            />
          );
        }

        if (config.openGraph.profile.lastName) {
          tagsToRender.push(
            <meta
              key="profile:last_name"
              property="profile:last_name"
              content={config.openGraph.profile.lastName}
            />
          );
        }

        if (config.openGraph.profile.username) {
          tagsToRender.push(
            <meta
              key="profile:username"
              property="profile:username"
              content={config.openGraph.profile.username}
            />
          );
        }

        if (config.openGraph.profile.gender) {
          tagsToRender.push(
            <meta
              key="profile:gender"
              property="profile:gender"
              content={config.openGraph.profile.gender}
            />
          );
        }
      } else if (type === "book" && config.openGraph.book) {
        if (config.openGraph.book.authors?.length) {
          config.openGraph.book.authors.forEach((author, index) => {
            tagsToRender.push(
              <meta
                key={`book:author:0${index}`}
                property="book:author"
                content={author}
              />
            );
          });
        }

        if (config.openGraph.book.isbn) {
          tagsToRender.push(
            <meta
              key="book:isbn"
              property="book:isbn"
              content={config.openGraph.book.isbn}
            />
          );
        }

        if (config.openGraph.book.releaseDate) {
          tagsToRender.push(
            <meta
              key="book:release_date"
              property="book:release_date"
              content={config.openGraph.book.releaseDate}
            />
          );
        }

        if (config.openGraph.book.tags?.length) {
          config.openGraph.book.tags.forEach((tag, index) => {
            tagsToRender.push(
              <meta
                key={`book:tag:0${index}`}
                property="book:tag"
                content={tag}
              />
            );
          });
        }
      } else if (type === "article" && config.openGraph.article) {
        if (config.openGraph.article.publishedTime) {
          tagsToRender.push(
            <meta
              key="article:published_time"
              property="article:published_time"
              content={config.openGraph.article.publishedTime}
            />
          );
        }

        if (config.openGraph.article.modifiedTime) {
          tagsToRender.push(
            <meta
              key="article:modified_time"
              property="article:modified_time"
              content={config.openGraph.article.modifiedTime}
            />
          );
        }

        if (config.openGraph.article.expirationTime) {
          tagsToRender.push(
            <meta
              key="article:expiration_time"
              property="article:expiration_time"
              content={config.openGraph.article.expirationTime}
            />
          );
        }

        if (config.openGraph.article.authors?.length) {
          config.openGraph.article.authors.forEach((author, index) => {
            tagsToRender.push(
              <meta
                key={`article:author:0${index}`}
                property="article:author"
                content={author}
              />
            );
          });
        }

        if (config.openGraph.article.section) {
          tagsToRender.push(
            <meta
              key="article:section"
              property="article:section"
              content={config.openGraph.article.section}
            />
          );
        }

        if (config.openGraph.article.tags?.length) {
          config.openGraph.article.tags.forEach((tag, index) => {
            tagsToRender.push(
              <meta
                key={`article:tag:0${index}`}
                property="article:tag"
                content={tag}
              />
            );
          });
        }
      } else if (
        (type === "video.movie" ||
          type === "video.episode" ||
          type === "video.tv_show" ||
          type === "video.other") &&
        config.openGraph.video
      ) {
        if (config.openGraph.video.actors?.length) {
          config.openGraph.video.actors.forEach((actor, index) => {
            if (actor.profile) {
              tagsToRender.push(
                <meta
                  key={`video:actor:0${index}`}
                  property="video:actor"
                  content={actor.profile}
                />
              );
            }

            if (actor.role) {
              tagsToRender.push(
                <meta
                  key={`video:actor:role:0${index}`}
                  property="video:actor:role"
                  content={actor.role}
                />
              );
            }
          });
        }

        if (config.openGraph.video.directors?.length) {
          config.openGraph.video.directors.forEach((director, index) => {
            tagsToRender.push(
              <meta
                key={`video:director:0${index}`}
                property="video:director"
                content={director}
              />
            );
          });
        }

        if (config.openGraph.video.writers?.length) {
          config.openGraph.video.writers.forEach((writer, index) => {
            tagsToRender.push(
              <meta
                key={`video:writer:0${index}`}
                property="video:writer"
                content={writer}
              />
            );
          });
        }

        if (config.openGraph.video.duration) {
          tagsToRender.push(
            <meta
              key="video:duration"
              property="video:duration"
              content={config.openGraph.video.duration.toString()}
            />
          );
        }

        if (config.openGraph.video.releaseDate) {
          tagsToRender.push(
            <meta
              key="video:release_date"
              property="video:release_date"
              content={config.openGraph.video.releaseDate}
            />
          );
        }

        if (config.openGraph.video.tags?.length) {
          config.openGraph.video.tags.forEach((tag, index) => {
            tagsToRender.push(
              <meta
                key={`video:tag:0${index}`}
                property="video:tag"
                content={tag}
              />
            );
          });
        }

        if (config.openGraph.video.series) {
          tagsToRender.push(
            <meta
              key="video:series"
              property="video:series"
              content={config.openGraph.video.series}
            />
          );
        }
      }
    }

    if (config.openGraph.images?.length) {
      tagsToRender.push(
        ...buildOpenGraphMediaTags("image", config.openGraph.images, {
          defaultWidth: config.openGraph.defaultImageWidth,
          defaultHeight: config.openGraph.defaultImageHeight,
        })
      );
    }

    // videos

    if (config.openGraph.videos?.length) {
      tagsToRender.push(
        ...buildOpenGraphMediaTags("video", config.openGraph.videos, {
          defaultWidth: config.openGraph.defaultVideoWidth,
          defaultHeight: config.openGraph.defaultVideoHeight,
        })
      );
    }

    // audio
    if (config.openGraph.audio) {
      tagsToRender.push(
        ...buildOpenGraphMediaTags("audio", config.openGraph.audio)
      );
    }

    if (config.openGraph.locale) {
      tagsToRender.push(
        <meta
          key="og:locale"
          property="og:locale"
          content={config.openGraph.locale}
        />
      );
    }

    if (config.openGraph.siteName) {
      tagsToRender.push(
        <meta
          key="og:site_name"
          property="og:site_name"
          content={config.openGraph.siteName}
        />
      );
    }
  }

  if (config.canonical) {
    tagsToRender.push(
      <link rel="canonical" href={config.canonical} key="canonical" />
    );
  }

  if (config.additionalMetaTags && config.additionalMetaTags.length > 0) {
    config.additionalMetaTags.forEach(({ keyOverride, ...tag }) => {
      tagsToRender.push(
        <meta
          key={`meta:${keyOverride ?? tag.name ?? tag.property ?? tag.httpEquiv}`}
          {...tag}
        />
      );
    });
  }

  if (config.additionalLinkTags?.length) {
    config.additionalLinkTags.forEach((tag) => {
      const { crossOrigin: tagCrossOrigin, ...rest } = tag;
      const crossOrigin: "anonymous" | "use-credentials" | "" | undefined =
        tagCrossOrigin === "anonymous" ||
        tagCrossOrigin === "use-credentials" ||
        tagCrossOrigin === ""
          ? tagCrossOrigin
          : undefined;

      tagsToRender.push(
        <link
          key={`link${rest.keyOverride ?? rest.href}${rest.rel}`}
          {...rest}
          crossOrigin={crossOrigin}
        />
      );
    });
  }

  if (
    config.breadcrumbList != null &&
    config.breadcrumbList.itemListElement.length > 0
  ) {
    tagsToRender.push(
      <script
        key="jsonld-breadcrumb"
        type="application/ld+json"
        id="jsonld-breadcrumb"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(config.breadcrumbList),
        }}
      />
    );
  }

  return tagsToRender;
};
