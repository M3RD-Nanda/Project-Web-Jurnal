"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fixLabelAccessibility } from "@/lib/accessibility-fixes";

/**
 * Test component to verify accessibility fixes are working
 * This component creates problematic label/input combinations and then fixes them
 */
export function AccessibilityTest() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  const runAccessibilityTest = () => {
    const results: string[] = [];

    // Create a test container
    const testContainer = document.createElement("div");
    testContainer.id = "accessibility-test-container";
    testContainer.innerHTML = `
      <!-- Test case 1: Label with non-existent for attribute -->
      <label for="non-existent-input">Test Label 1</label>
      <input type="text" placeholder="Input without matching ID" />
      
      <!-- Test case 2: Input without ID -->
      <label for="missing-input">Test Label 2</label>
      <input type="email" placeholder="Email input" />
      
      <!-- Test case 3: Label with correct for attribute (should not be changed) -->
      <label for="correct-input">Test Label 3</label>
      <input type="text" id="correct-input" placeholder="Correct input" />
      
      <!-- Test case 4: Input without label -->
      <input type="password" placeholder="Password without label" />
    `;

    document.body.appendChild(testContainer);

    try {
      // Count issues before fix
      const labelsBefore = testContainer.querySelectorAll("label[for]");
      const inputsBefore = testContainer.querySelectorAll("input");
      let issuesBefore = 0;

      labelsBefore.forEach((label) => {
        const forAttr = label.getAttribute("for");
        if (forAttr && !testContainer.querySelector(`#${forAttr}`)) {
          issuesBefore++;
        }
      });

      inputsBefore.forEach((input) => {
        if (!input.id) {
          const associatedLabel = testContainer.querySelector(
            `label[for="${input.id}"]`
          );
          if (!associatedLabel && !input.getAttribute("aria-label")) {
            issuesBefore++;
          }
        }
      });

      results.push(`Issues found before fix: ${issuesBefore}`);

      // Apply the fix
      fixLabelAccessibility(testContainer);

      // Count issues after fix
      const labelsAfter = testContainer.querySelectorAll("label[for]");
      const inputsAfter = testContainer.querySelectorAll("input");
      let issuesAfter = 0;

      labelsAfter.forEach((label) => {
        const forAttr = label.getAttribute("for");
        if (forAttr && !testContainer.querySelector(`#${forAttr}`)) {
          issuesAfter++;
        }
      });

      inputsAfter.forEach((input) => {
        if (!input.id) {
          issuesAfter++;
        } else {
          const associatedLabel = testContainer.querySelector(
            `label[for="${input.id}"]`
          );
          if (!associatedLabel && !input.getAttribute("aria-label")) {
            issuesAfter++;
          }
        }
      });

      results.push(`Issues found after fix: ${issuesAfter}`);
      results.push(`Fix successful: ${issuesAfter === 0 ? "YES" : "NO"}`);

      // Detailed analysis
      results.push("--- Detailed Analysis ---");
      labelsAfter.forEach((label, index) => {
        const forAttr = label.getAttribute("for");
        const correspondingInput = forAttr
          ? testContainer.querySelector(`#${forAttr}`)
          : null;
        results.push(
          `Label ${index + 1}: for="${forAttr}" -> ${
            correspondingInput ? "MATCHED" : "NO MATCH"
          }`
        );
      });

      inputsAfter.forEach((input, index) => {
        const id = input.id;
        const ariaLabel = input.getAttribute("aria-label");
        const associatedLabel = id
          ? testContainer.querySelector(`label[for="${id}"]`)
          : null;
        results.push(
          `Input ${index + 1}: id="${id}" aria-label="${ariaLabel}" -> ${
            associatedLabel ? "HAS LABEL" : "NO LABEL"
          }`
        );
      });
    } catch (error) {
      results.push(`Error during test: ${error}`);
    } finally {
      // Clean up
      document.body.removeChild(testContainer);
    }

    setTestResults(results);
  };

  const checkCurrentPageAccessibility = () => {
    const results: string[] = [];

    // Check current page for accessibility issues
    const allLabels = document.querySelectorAll("label[for]");
    const allInputs = document.querySelectorAll("input, select, textarea");

    let totalIssues = 0;

    results.push("=== Current Page Accessibility Check ===");

    // Check labels
    allLabels.forEach((label, index) => {
      const forAttr = label.getAttribute("for");
      if (forAttr) {
        const correspondingInput = document.querySelector(`#${forAttr}`);
        if (!correspondingInput) {
          results.push(
            `❌ Label ${index + 1}: for="${forAttr}" has no matching element`
          );
          totalIssues++;
        } else {
          results.push(
            `✅ Label ${index + 1}: for="${forAttr}" correctly matched`
          );
        }
      }
    });

    // Check inputs without proper labels
    allInputs.forEach((input, index) => {
      const id = input.id;
      const ariaLabel = input.getAttribute("aria-label");
      const ariaLabelledBy = input.getAttribute("aria-labelledby");

      if (id) {
        const associatedLabel = document.querySelector(`label[for="${id}"]`);
        if (!associatedLabel && !ariaLabel && !ariaLabelledBy) {
          results.push(
            `❌ Input ${
              index + 1
            }: id="${id}" has no associated label or aria-label`
          );
          totalIssues++;
        } else {
          results.push(`✅ Input ${index + 1}: id="${id}" properly labeled`);
        }
      } else if (!ariaLabel && !ariaLabelledBy) {
        results.push(
          `❌ Input ${index + 1}: no id, aria-label, or aria-labelledby`
        );
        totalIssues++;
      }
    });

    results.push(`\n📊 Total accessibility issues found: ${totalIssues}`);
    results.push(
      `🎯 Page accessibility status: ${
        totalIssues === 0 ? "GOOD" : "NEEDS IMPROVEMENT"
      }`
    );

    setTestResults(results);
  };

  if (!isVisible) {
    return (
      <Button
        onClick={() => setIsVisible(true)}
        variant="outline"
        className="fixed bottom-4 right-4 z-50"
      >
        🔍 Test Accessibility
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-96 max-h-96 overflow-auto z-50 shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex justify-between items-center">
          Accessibility Test
          <Button onClick={() => setIsVisible(false)} variant="ghost" size="sm">
            ✕
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex gap-2">
          <Button onClick={runAccessibilityTest} size="sm" variant="outline">
            Run Test
          </Button>
          <Button
            onClick={checkCurrentPageAccessibility}
            size="sm"
            variant="outline"
          >
            Check Page
          </Button>
        </div>

        {testResults.length > 0 && (
          <div className="mt-4 p-2 bg-muted rounded text-xs font-mono max-h-48 overflow-auto">
            {testResults.map((result, index) => (
              <div key={index} className="mb-1">
                {result}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
