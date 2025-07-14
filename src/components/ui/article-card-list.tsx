"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Article } from "@/lib/articles";
import React, { memo, useState } from "react";
import { ArticleCardSkeleton } from "@/components/ui/skeleton-loader";

// Memoized Article Card Component for better performance
const ArticleCard = memo(({ article }: { article: Article }) => (
  <Card className="hover:shadow-lg transition-shadow duration-300">
    <CardHeader>
      <CardTitle className="text-lg font-semibold">{article.title}</CardTitle>
      <CardDescription className="text-sm text-muted-foreground">
        Oleh: {article.authors}
      </CardDescription>
    </CardHeader>
    <CardContent>
      <p className="text-sm line-clamp-3">{article.abstract}</p>
    </CardContent>
    <CardFooter>
      <Button variant="link" asChild className="p-0 h-auto">
        <Link href={`/articles/${article.id}`}>Baca Selengkapnya →</Link>
      </Button>
    </CardFooter>
  </Card>
));

ArticleCard.displayName = "ArticleCard";

interface ArticleCardListProps {
  articles: Article[];
}

const ArticleCardList = memo(function ArticleCardList({
  articles,
}: ArticleCardListProps) {
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading state for better CLS prevention
  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 100);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <ArticleCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
});

export default ArticleCardList;
