import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React from "react";

interface StaticContentPageProps {
  title: string;
  children: React.ReactNode;
}

export function StaticContentPage({ title, children }: StaticContentPageProps) {
  return (
    <div className="flex-1 p-4 md:p-8 container mx-auto">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-lg">
          {children}
        </CardContent>
      </Card>
    </div>
  );
}