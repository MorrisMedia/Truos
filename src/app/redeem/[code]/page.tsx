import { redirect } from 'next/navigation';

export default function RedeemCodePage({ params }: { params: { code: string } }) {
  // Send unauth'd users to sign-up with code prefilled; authed users go to account
  redirect(`/sign-up?code=${encodeURIComponent(params.code)}`);
}
