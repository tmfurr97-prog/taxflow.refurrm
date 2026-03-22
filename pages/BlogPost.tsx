import { useParams, Link, Navigate } from 'react-router-dom';
import { blogPosts } from '../data/blogPosts';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const post = blogPosts.find(p => p.slug === slug);

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'tax-tips': return 'bg-blue-100 text-blue-800';
      case 'financial-advice': return 'bg-green-100 text-green-800';
      case 'platform-updates': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Link to="/blog">
          <Button variant="ghost" className="mb-8">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Button>
        </Link>

        <article>
          <img 
            src={post.image} 
            alt={post.title}
            className="w-full h-96 object-cover rounded-lg mb-8"
          />

          <div className="flex items-center gap-3 mb-4">
            <Badge className={getCategoryColor(post.category)}>
              {post.category.replace('-', ' ')}
            </Badge>
            <span className="text-gray-500">{post.readTime}</span>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-4">{post.title}</h1>
          
          <div className="flex items-center justify-between text-gray-600 mb-8 pb-8 border-b">
            <span>By {post.author}</span>
            <span>{post.date}</span>
          </div>

          <div className="prose prose-lg max-w-none">
            {post.content.split('\n\n').map((paragraph, index) => {
              if (paragraph.startsWith('## ')) {
                return <h2 key={index} className="text-2xl font-bold mt-8 mb-4">{paragraph.replace('## ', '')}</h2>;
              } else if (paragraph.startsWith('**')) {
                return <p key={index} className="mb-4"><strong>{paragraph.replace(/\*\*/g, '')}</strong></p>;
              } else if (paragraph.startsWith('- ')) {
                const items = paragraph.split('\n');
                return (
                  <ul key={index} className="list-disc pl-6 mb-4 space-y-2">
                    {items.map((item, i) => <li key={i}>{item.replace('- ', '')}</li>)}
                  </ul>
                );
              } else if (/^\d+\./.test(paragraph)) {
                const items = paragraph.split('\n');
                return (
                  <ol key={index} className="list-decimal pl-6 mb-4 space-y-2">
                    {items.map((item, i) => <li key={i}>{item.replace(/^\d+\.\s/, '')}</li>)}
                  </ol>
                );
              } else {
                return <p key={index} className="mb-4 text-gray-700 leading-relaxed">{paragraph}</p>;
              }
            })}
          </div>

          <div className="mt-12 pt-8 border-t">
            <Link to="/blog">
              <Button>View All Posts</Button>
            </Link>
          </div>
        </article>
      </div>
    </div>
  );
}
