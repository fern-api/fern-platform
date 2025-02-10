interface APIMessage {
  role: string;
  content: string | { text: string; type: string }[];
}

interface Message {
  role: string;
  content: string;
}

interface DomainMessages {
  domain: string;
  content: Message[];
}

const BRAINTRUST_PROJECT_ID = "9f4a7638-9f59-47f7-8cca-d6c9f4d0e270";

// const MessageTable = ({ data }: { data: DomainMessages[] }) => {
//   return (
//     <div className="w-full overflow-x-auto">
//       <table className="w-full border-collapse">
//         <thead>
//           <tr className="bg-gray-100">
//             <th className="border border-gray-200 p-4 text-left font-medium">
//               Domain
//             </th>
//             <th className="border border-gray-200 p-4 text-left font-medium">
//               Messages
//             </th>
//           </tr>
//         </thead>
//         <tbody>
//           {data.map((item, index) => (
//             <tr
//               key={index}
//               className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
//             >
//               <td className="border border-gray-200 p-4 align-top">
//                 {item.domain}
//               </td>
//               <td className="border border-gray-200 p-4">
//                 <div className="space-y-4">
//                   {item.content.map((message, msgIndex) => (
//                     <div
//                       key={msgIndex}
//                       className={`rounded-lg p-3 ${
//                         message.role === "assistant"
//                           ? "bg-blue-50"
//                           : message.role === "user"
//                             ? "bg-green-50"
//                             : "bg-gray-50"
//                       }`}
//                     >
//                       <div className="mb-1 text-sm font-medium text-gray-700">
//                         {message.role}
//                       </div>
//                       <div className="whitespace-pre-wrap text-sm">
//                         {message.content}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

export default async function Home() {
  const url = "https://api.braintrust.dev/btql";
  const headers = {
    Authorization: `Bearer ${process.env.BRAINTRUST_API_KEY}`,
    "Content-Type": "application/json",
  };
  const body = {
    query: `select: * | from: project_logs('${BRAINTRUST_PROJECT_ID}') | limit: 100`,
  };
  const response = await fetch(url, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(body),
  });

  const jsonData = await response.json();
  console.log(jsonData);
  const data = jsonData.data;

  const processedData: DomainMessages[] = [];

  for (const convo of data) {
    if (convo.input !== null && convo.output !== null) {
      let domain = "";
      convo.input.forEach((msg: APIMessage) => {
        if (msg.role === "system") {
          if (typeof msg.content === "string") {
            if (msg.content && msg.content.includes("elevenlabs.io")) {
              domain = "elevenlabs.io";
            } else {
              domain = "buildwithfern.com";
            }
          }
        }
      });

      const cleanedInput = convo.input
        .map((msg: APIMessage) => {
          if (msg.role === "user") {
            if (typeof msg.content === "string") {
              return {
                role: "user",
                content: msg.content,
              };
            }
            return {
              role: "user",
              content: msg.content[0].text,
            };
          } else {
            return msg;
          }
        })
        .filter((msg: Message) => msg.role !== "system" && msg.role !== "tool");
      cleanedInput.push(convo.output.message);
      processedData.push({ domain, content: cleanedInput });
    }
  }
  console.log(processedData);

  return (
    <div className="grid min-h-screen grid-rows-[20px_1fr_20px] items-center justify-items-center gap-16 p-8 pb-20 font-[family-name:var(--font-geist-sans)] sm:p-20">
      {/* <MessageTable data={processedData} /> */}
    </div>
  );
}
