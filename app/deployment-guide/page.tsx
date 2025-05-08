export default function DeploymentGuidePage() {
  return (
    <div className="container mx-auto py-10 px-4 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Deployment Guide</h1>

      <div className="prose max-w-none">
        <h2>Clearing Vercel Deployment Cache</h2>

        <p>Follow these steps to clear your Vercel deployment cache and perform a fresh deployment:</p>

        <h3>Using the Vercel Dashboard</h3>

        <ol>
          <li>
            <strong>Log in to Vercel Dashboard</strong>
            <p>
              Go to{" "}
              <a href="https://vercel.com/dashboard" target="_blank" rel="noopener noreferrer">
                https://vercel.com/dashboard
              </a>{" "}
              and log in to your account.
            </p>
          </li>
          <li>
            <strong>Select Your Project</strong>
            <p>Find and click on the "SmartPRO Business Services Hub" project.</p>
          </li>
          <li>
            <strong>Access Project Settings</strong>
            <p>Click on the "Settings" tab in the top navigation.</p>
          </li>
          <li>
            <strong>Find Build & Development Settings</strong>
            <p>Scroll down to find the "Build & Development Settings" section.</p>
          </li>
          <li>
            <strong>Clear Cache</strong>
            <p>Look for the "Build Cache" option and click "Clear Cache".</p>
          </li>
          <li>
            <strong>Redeploy</strong>
            <p>
              Go back to the "Deployments" tab and click "Redeploy" on your latest deployment, or create a new
              deployment.
            </p>
          </li>
        </ol>

        <h3>Using Vercel CLI</h3>

        <p>If you prefer using the command line:</p>

        <ol>
          <li>
            <strong>Install Vercel CLI</strong>
            <pre>
              <code>npm install -g vercel</code>
            </pre>
          </li>
          <li>
            <strong>Log in to Vercel</strong>
            <pre>
              <code>vercel login</code>
            </pre>
          </li>
          <li>
            <strong>Navigate to Your Project Directory</strong>
            <pre>
              <code>cd path/to/your/project</code>
            </pre>
          </li>
          <li>
            <strong>Clear Build Cache and Deploy</strong>
            <pre>
              <code>vercel deploy --force</code>
            </pre>
            <p>
              The <code>--force</code> flag bypasses the build cache and performs a fresh deployment.
            </p>
          </li>
        </ol>

        <h3>Verify Environment Variables</h3>

        <p>Before deploying, make sure all your environment variables are correctly set:</p>

        <ol>
          <li>
            <strong>In Vercel Dashboard</strong>
            <p>Go to Project Settings → Environment Variables</p>
          </li>
          <li>
            <strong>Check Required Variables</strong>
            <ul>
              <li>
                <code>NEXTAUTH_URL</code> - Should match your deployment URL
              </li>
              <li>
                <code>NEXTAUTH_SECRET</code> - Should be a strong, random string
              </li>
              <li>
                <code>NEXT_PUBLIC_APP_URL</code> - Should match your deployment URL
              </li>
              <li>
                <code>NEXT_PUBLIC_SUPABASE_URL</code> - Your Supabase project URL
              </li>
              <li>
                <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> - Your Supabase anon key
              </li>
            </ul>
          </li>
          <li>
            <strong>Verify Environment Scope</strong>
            <p>Ensure variables are set for the correct environments (Production, Preview, Development)</p>
          </li>
        </ol>

        <h3>After Deployment</h3>

        <p>After your fresh deployment is complete:</p>

        <ol>
          <li>
            <strong>Test Authentication</strong>
            <p>
              Visit the <a href="/auth-test">Authentication Test Page</a> to verify that authentication is working
              correctly.
            </p>
          </li>
          <li>
            <strong>Check Environment Variables</strong>
            <p>
              Visit the <a href="/api/debug/env">Environment Variables Debug API</a> to ensure all variables are
              correctly set.
            </p>
          </li>
          <li>
            <strong>Monitor Logs</strong>
            <p>Check the Function Logs in Vercel Dashboard for any errors or issues.</p>
          </li>
        </ol>

        <h2>Troubleshooting Common Deployment Issues</h2>

        <h3>CORS Errors</h3>

        <p>If you're experiencing CORS errors after deployment:</p>

        <ol>
          <li>Verify that your Supabase project has the correct CORS origins set</li>
          <li>Check that your middleware is correctly handling CORS headers</li>
          <li>Ensure your API routes are returning the proper CORS headers</li>
        </ol>

        <h3>Authentication Failures</h3>

        <p>If authentication is failing:</p>

        <ol>
          <li>
            Verify that <code>NEXTAUTH_URL</code> matches your deployment URL exactly
          </li>
          <li>
            Check that <code>NEXTAUTH_SECRET</code> is properly set
          </li>
          <li>Ensure Supabase redirect URLs include your deployment URL</li>
          <li>Check browser console for any JavaScript errors</li>
        </ol>

        <h3>Environment Variable Issues</h3>

        <p>If environment variables aren't being recognized:</p>

        <ol>
          <li>Ensure they're set in the correct scope (Production, Preview, Development)</li>
          <li>Check for typos in variable names (they're case-sensitive)</li>
          <li>
            Verify that client-side variables are prefixed with <code>NEXT_PUBLIC_</code>
          </li>
          <li>Try redeploying after making changes to environment variables</li>
        </ol>
      </div>
    </div>
  )
}
