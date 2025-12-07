import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import SafeariFullLogo  from "@/assets/logofull.svg";
import { Footer } from '@/components/Footer';
import { ArrowLeft } from 'lucide-react';

const Terms = () => {
  const [content, setContent] = useState('');

  useEffect(() => {
    fetch('/terms.md')
      .then((response) => response.text())
      .then((text) => setContent(text))
      .catch((error) => console.error('Error loading terms:', error));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <img src={SafeariFullLogo} alt="Safeari" className="h-7 sm:h-8 w-auto" />
            </Link>
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">Last Updated: November 6, 2025</p>
        </div>
        <article className="prose prose-slate dark:prose-invert max-w-none">
          <div
            className="markdown-content space-y-6"
            dangerouslySetInnerHTML={{
              __html: content
                .replace(/^# (.+)$/gm, '<h1 class="text-4xl font-bold mb-6">$1</h1>')
                .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-semibold mt-8 mb-4">$1</h2>')
                .replace(/^### (.+)$/gm, '<h3 class="text-xl font-semibold mt-6 mb-3">$1</h3>')
                .replace(/^\*\*(.+?)\*\*:/gm, '<p class="font-semibold mt-4 mb-2">$1:</p>')
                .replace(/^\*\*(.+?)\*\*/gm, '<strong>$1</strong>')
                .replace(/^- (.+)$/gm, '<li class="ml-6 list-disc">$1</li>')
                .replace(/^---$/gm, '<hr class="my-8 border-border">')
                .replace(/\n\n/g, '</p><p class="mb-4">')
                .replace(/^(?!<[h|l|p])/gm, '<p class="mb-4">')
            }}
          />
        </article>
      </main>

      <Footer />
    </div>
  );
};

export default Terms;
