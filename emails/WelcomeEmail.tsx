// emails/WelcomeEmail.tsx

type WelcomeEmailProps = { email: string };

export function WelcomeEmail({ email }: WelcomeEmailProps) {
  return (
    <div>
      <h1>Welcome to Quotes Newsletter!</h1>
      <p>{email}, it&apos;s so good having you here! 💜</p>
      <p>You&apos;ll start receiving quotes soon!</p>
    </div>
  );
}
