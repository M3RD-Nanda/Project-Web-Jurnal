"use client";

import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useSupabase } from "@/components/SessionProvider"; // Import useSupabase hook
import { useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export default function LoginPage() {
  const { supabase } = useSupabase();

  // Fix label accessibility issues for Supabase Auth UI
  useEffect(() => {
    const fixLabelAccessibility = () => {
      // Wait for Supabase Auth UI to render
      setTimeout(() => {
        const authContainer =
          document.querySelector("[data-supabase-auth-ui]") ||
          document.querySelector(".supabase-auth-ui_ui");
        if (!authContainer) return;

        // Find all labels and inputs within the auth container
        const labels = authContainer.querySelectorAll("label");
        const inputs = authContainer.querySelectorAll(
          "input, select, textarea"
        );

        labels.forEach((label) => {
          const forAttr = label.getAttribute("for");
          if (forAttr) {
            // Check if there's a corresponding input with this id
            const correspondingInput = authContainer.querySelector(
              `#${forAttr}`
            );
            if (!correspondingInput) {
              // Try to find the input by other means (next sibling, parent-child relationship)
              const targetInput = label.nextElementSibling;
              if (
                targetInput &&
                (targetInput.tagName === "INPUT" ||
                  targetInput.tagName === "SELECT" ||
                  targetInput.tagName === "TEXTAREA")
              ) {
                // Generate a unique id if the input doesn't have one
                if (!targetInput.id) {
                  const uniqueId = `auth-input-${Math.random()
                    .toString(36)
                    .substr(2, 9)}`;
                  targetInput.id = uniqueId;
                  label.setAttribute("for", uniqueId);
                }
              } else {
                // Look for input within the same parent container
                const parentContainer = label.closest("div");
                if (parentContainer) {
                  const inputInContainer = parentContainer.querySelector(
                    "input, select, textarea"
                  );
                  if (inputInContainer && !inputInContainer.id) {
                    const uniqueId = `auth-input-${Math.random()
                      .toString(36)
                      .substr(2, 9)}`;
                    inputInContainer.id = uniqueId;
                    label.setAttribute("for", uniqueId);
                  }
                }
              }
            }
          }
        });

        // Also ensure inputs without labels get proper accessibility attributes
        inputs.forEach((input) => {
          if (!input.id) {
            input.id = `auth-input-${Math.random().toString(36).substr(2, 9)}`;
          }

          // Add aria-label if no associated label is found
          const associatedLabel = authContainer.querySelector(
            `label[for="${input.id}"]`
          );
          if (!associatedLabel && !input.getAttribute("aria-label")) {
            const placeholder = input.getAttribute("placeholder");
            const type = input.getAttribute("type");
            if (placeholder) {
              input.setAttribute("aria-label", placeholder);
            } else if (type) {
              input.setAttribute(
                "aria-label",
                type.charAt(0).toUpperCase() + type.slice(1)
              );
            }
          }
        });
      }, 100);
    };

    // Run the fix initially
    fixLabelAccessibility();

    // Also run when the component updates (e.g., switching between sign in/sign up)
    const observer = new MutationObserver(fixLabelAccessibility);
    const targetNode = document.body;
    observer.observe(targetNode, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div className="flex-1 flex items-center justify-center p-4 md:p-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Login</CardTitle>
          <CardDescription>
            Masuk ke akun Anda untuk mengakses fitur jurnal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Auth
            supabaseClient={supabase}
            providers={[]}
            view="sign_in"
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: "hsl(var(--primary))",
                    brandAccent: "hsl(var(--primary-hover))",
                    inputBackground: "hsl(var(--background))",
                    inputBorder: "hsl(var(--border))",
                    inputBorderHover: "hsl(var(--ring))",
                    inputBorderFocus: "hsl(var(--ring))",
                    inputText: "hsl(var(--foreground))",
                  },
                },
              },
            }}
            theme="light"
            redirectTo={
              typeof window !== "undefined"
                ? `${window.location.origin}/`
                : "http://localhost:3000/"
            }
            onlyThirdPartyProviders={false}
            magicLink={false}
            showLinks={true}
          />
        </CardContent>
      </Card>
    </div>
  );
}
