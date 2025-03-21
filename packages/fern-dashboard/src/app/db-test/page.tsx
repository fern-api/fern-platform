import { loadFromDb } from "../actions/loadFromDb";

export default async function DbTest() {
  const dbStuff = await loadFromDb();
  return (
    <div className="flex flex-1">
      <pre>{JSON.stringify(dbStuff, undefined, 4)}</pre>
    </div>
  );
}
