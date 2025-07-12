"use client";

import { useEffect, useState } from "react";
import { validateEnvironment, validateSupabaseConfig } from "@/lib/env-check";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface EnvStatus {
  isValid: boolean;
  missingRequired: string[];
  environment: string;
}

export default function DebugEnvPage() {
  const [envStatus, setEnvStatus] = useState<EnvStatus | null>(null);
  const [supabaseStatus, setSupabaseStatus] = useState<boolean | null>(null);
  const [connectionTest, setConnectionTest] = useState<string | null>(null);

  useEffect(() => {
    // Validate environment on mount
    const envValidation = validateEnvironment();
    const supabaseValidation = validateSupabaseConfig();
    
    setEnvStatus(envValidation);
    setSupabaseStatus(supabaseValidation);
  }, []);

  const testSupabaseConnection = async () => {
    setConnectionTest("Testing...");
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        setConnectionTest(`❌ Connection failed: ${error.message}`);
      } else {
        setConnectionTest("✅ Connection successful");
      }
    } catch (err) {
      setConnectionTest(`❌ Connection error: ${err}`);
    }
  };

  const envVars = [
    {
      name: "NEXT_PUBLIC_SUPABASE_URL",
      value: process.env.NEXT_PUBLIC_SUPABASE_URL,
      required: true,
    },
    {
      name: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      value: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      required: true,
    },
    {
      name: "NEXT_PUBLIC_SITE_URL",
      value: process.env.NEXT_PUBLIC_SITE_URL,
      required: false,
    },
    {
      name: "NODE_ENV",
      value: process.env.NODE_ENV,
      required: false,
    },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Environment Debug Page</h1>
        <p className="text-muted-foreground mt-2">
          Debug environment variables and Supabase configuration
        </p>
      </div>

      {/* Environment Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Environment Status
            {envStatus?.isValid ? (
              <Badge variant="default">✅ Valid</Badge>
            ) : (
              <Badge variant="destructive">❌ Invalid</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><strong>Environment:</strong> {envStatus?.environment}</p>
            {envStatus?.missingRequired && envStatus.missingRequired.length > 0 && (
              <div>
                <p className="text-red-600 font-semibold">Missing Required Variables:</p>
                <ul className="list-disc list-inside text-red-600">
                  {envStatus.missingRequired.map((varName) => (
                    <li key={varName}>{varName}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Supabase Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Supabase Configuration
            {supabaseStatus ? (
              <Badge variant="default">✅ Valid</Badge>
            ) : (
              <Badge variant="destructive">❌ Invalid</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button onClick={testSupabaseConnection} variant="outline">
              Test Supabase Connection
            </Button>
            {connectionTest && (
              <p className="text-sm">{connectionTest}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Environment Variables */}
      <Card>
        <CardHeader>
          <CardTitle>Environment Variables</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {envVars.map((envVar) => (
              <div key={envVar.name} className="flex items-center justify-between p-3 border rounded">
                <div>
                  <p className="font-medium">{envVar.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {envVar.required ? "Required" : "Optional"}
                  </p>
                </div>
                <div className="text-right">
                  {envVar.value ? (
                    <div>
                      <Badge variant="default">✅ SET</Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {envVar.value.substring(0, 20)}...
                      </p>
                    </div>
                  ) : (
                    <Badge variant={envVar.required ? "destructive" : "secondary"}>
                      {envVar.required ? "❌ MISSING" : "⚠️ NOT SET"}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Setup Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p><strong>If you see missing variables:</strong></p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Go to Vercel Dashboard → Project Settings → Environment Variables</li>
              <li>Add the missing environment variables</li>
              <li>Redeploy the project</li>
              <li>Refresh this page to verify</li>
            </ol>
            <p className="mt-4 text-muted-foreground">
              See VERCEL_ENV_SETUP.md for detailed instructions.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
