import { Button } from "../ui/button";

export const LogoutButton = () => {
  return (
    <Button asChild className="min-w-40">
      <a href="/auth/logout">Logout</a>
    </Button>
  );
};
