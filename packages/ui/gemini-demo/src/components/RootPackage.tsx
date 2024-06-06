// import { googleSans } from "@/fonts/google-sans";
// import { fdr } from "@/gemini";
// import { isSubpackage } from "@/utils/isSubpackage";
// import { APIV1Write } from "@fern-api/fdr-sdk";
// import clsx from "clsx";
// import { ReactElement } from "react";
// import { PackageSection } from "./PackageSection";

// export function RootPackage({ package: pkg }: { package: APIV1Write.ApiDefinitionPackage }): ReactElement {
//     while (pkg.pointsTo != null) {
//         pkg = fdr.subpackages[pkg.pointsTo];
//     }

//     return (
//         <>
//             <PackageSection>
//                 <section className="py-10">
//                     <header>
//                         <h1 className={clsx(googleSans.className, "text-[2.25rem] font-normal mb-3")}>API Reference</h1>
//                     </header>
//                     <div className="grid grid-cols-2 gap-10 relative">
//                         <div>{isSubpackage(pkg) ? pkg.description : undefined}</div>
//                         {(pkg.endpoints.length > 0 || pkg.) && (
//                             <aside className="sticky top-0">
//                                 <div className="bg-[#F1F3F4]">
//                                     <div className="px-3 py-2 border-b border-[#DADCE0] uppercase text-xs font-medium text-gray-600">
//                                         Endpoints
//                                     </div>
//                                     <div className="px-3 py-2">
//                                         <ul>
//                                             {service?.endpoints.map((endpoint) => (
//                                                 <li key={endpoint.id}>
//                                                     <a
//                                                         className={clsx(
//                                                             robotoMono.className,
//                                                             "inline-flex gap-2 text-sm cursor-pointer",
//                                                         )}
//                                                     >
//                                                         <span className="text-right uppercase w-14">
//                                                             {endpoint.method}
//                                                         </span>
//                                                         <span>{pathToString(endpoint.fullPath)}</span>
//                                                     </a>
//                                                 </li>
//                                             ))}
//                                         </ul>
//                                     </div>
//                                 </div>
//                             </aside>
//                         )}
//                     </div>
//                 </section>
//             </PackageSection>
//         </>
//     );
// }
