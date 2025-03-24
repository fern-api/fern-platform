import { Button } from "../ui/button";

export const LogoutButton = () => {
  return (
    <Button asChild>
      <a href="/auth/logout">Logout</a>
    </Button>
  );
};
