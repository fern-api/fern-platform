import { withPageAuthRequired } from "@auth0/nextjs-auth0";

export default withPageAuthRequired(async () => {
  return <div>members</div>;
});
