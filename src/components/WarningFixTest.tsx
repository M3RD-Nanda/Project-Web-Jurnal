"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogTrigger, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Test component to verify that the warning fixes are working
 */
export function WarningFixTest() {
  const [isVisible, setIsVisible] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);

  const runWarningTest = () => {
    const results: string[] = [];
    
    // Test 1: Check for label accessibility issues
    const labels = document.querySelectorAll("label[for]");
    let labelIssues = 0;
    
    labels.forEach((label) => {
      const forAttr = label.getAttribute("for");
      if (forAttr) {
        const correspondingInput = document.querySelector(`#${forAttr}`);
        if (!correspondingInput) {
          labelIssues++;
        }
      }
    });
    
    results.push(`Label accessibility issues found: ${labelIssues}`);
    
    // Test 2: Check for dialog accessibility issues
    const dialogContents = document.querySelectorAll("[data-radix-dialog-content]");
    let dialogIssues = 0;
    
    dialogContents.forEach((content) => {
      const ariaDescribedBy = content.getAttribute("aria-describedby");
      const hasDescription = content.querySelector("[data-radix-dialog-description]");
      
      if (ariaDescribedBy === "undefined" || (ariaDescribedBy === "" && !hasDescription)) {
        dialogIssues++;
      }
    });
    
    results.push(`Dialog accessibility issues found: ${dialogIssues}`);
    results.push(`Total issues: ${labelIssues + dialogIssues}`);
    
    if (labelIssues === 0 && dialogIssues === 0) {
      results.push("✅ All accessibility warnings should be fixed!");
    } else {
      results.push("❌ Some issues still exist");
    }
    
    setTestResults(results);
  };

  useEffect(() => {
    // Run test after component mounts
    setTimeout(runWarningTest, 1000);
  }, []);

  if (!isVisible) {
    return (
      <Button 
        onClick={() => setIsVisible(true)}
        variant="outline"
        size="sm"
        className="fixed bottom-4 right-4 z-50"
      >
        Test Warnings Fix
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-96 z-50 max-h-96 overflow-auto">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex justify-between items-center">
          Warning Fix Test Results
          <Button 
            onClick={() => setIsVisible(false)}
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
          >
            ×
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="space-y-1">
          {testResults.map((result, index) => (
            <div key={index} className="text-xs font-mono">
              {result}
            </div>
          ))}
        </div>
        
        <div className="flex gap-2">
          <Button onClick={runWarningTest} size="sm" variant="outline">
            Re-test
          </Button>
          
          {/* Test Dialog without Description */}
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                Test Dialog
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Test Dialog</DialogTitle>
                <DialogDescription>
                  This dialog has a proper description to avoid warnings.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                <Label htmlFor="test-input">Test Input</Label>
                <Input id="test-input" placeholder="This should have proper label association" />
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Test problematic label (should be fixed automatically) */}
        <div className="border p-2 rounded text-xs">
          <div className="text-muted-foreground mb-1">Test Elements:</div>
          <Label htmlFor="non-existent-input">Problematic Label</Label>
          <Input placeholder="Input without matching ID" className="mt-1" />
        </div>
      </CardContent>
    </Card>
  );
}
