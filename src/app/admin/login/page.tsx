import LoginForm from '@/components/LoginForm';
export const metadata = { title: 'Sign in', robots: { index: false } };
export default function Login() {
  return (
    <main className="wrap detail" style={{ maxWidth: 460 }}>
      <div className="eyebrow rl">Blackpearl staff</div>
      <h1 className="atitle">Sign in</h1>
      <LoginForm />
    </main>
  );
}
