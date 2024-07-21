import { createFileRoute, notFound } from '@tanstack/react-router';

export const Route = createFileRoute('/posts/$postId')({
  loader: ({ params: { postId } }) => {
    if (isNaN(Number(postId))) throw notFound();
  },
  component: PostComponent,
  notFoundComponent: () => {
    return <p>This post doesn't exist!</p>;
  },
});

function PostComponent() {
  const { postId } = Route.useParams();

  return <div>Post {postId}</div>;
}
