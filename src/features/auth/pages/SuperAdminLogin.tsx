import { LoginForm } from "../components/LoginForm";

export function SuperAdminLoginPage() {
  return <LoginForm expectedRole="SUPER_ADMIN" />;
}
