import { createFileRoute } from '@tanstack/react-router';
import Signin from '../../components/Signin';

export const Route = createFileRoute('/_auth/signin')({
  component: () => <Signin />,
});
