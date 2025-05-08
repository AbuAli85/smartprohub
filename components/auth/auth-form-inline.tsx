"use client"

import type React from "react"
import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import Link from "next/link"
import type { UserRole } from "@/lib/supabase/database.types"
import { Loader2, AlertTriangle } from "lucide-react"

type AuthFormProps = {
  type?: "login" | "register"
}

function AuthFormInline({ type = "login" }: AuthFormProps) {
  const searchParams = useSearchParams()
  const redirectedFrom = searchParams.get("redirectedFrom") || "/dashboard"
  const errorParam = searchParams.get("error")

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [role, setRole] = useState<UserRole>("client")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [activeTab, setActiveTab] = useState<"login" | "register">(type)

  const supabase = createClientComponentClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) throw authError
      if (!authData.user) throw new Error("Authentication successful but no user returned")

      setMessage({
        type: "success",
        text: "Login successful! Redirecting...",
      })

      window.location.href = redirectedFrom || "/dashboard"
    } catch (error: any) {
      console.error("Login error:", error)
      setMessage({
        type: "error",
        text: error.message || "An error occurred during login",
      })
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            full_name: fullName,
            role: role,
          },
        },
      })

      if (error) throw error

      if (data.user) {
        try {
          const { error: profileError } = await supabase.from("profiles").insert({
            id: data.user.id,
            email: data.user.email,
            full_name: fullName,
            role: role,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })

          if (profileError) {
            console.error("Error creating profile during registration:", profileError)
          }
        } catch (profileError) {
          console.error("Exception creating profile during registration:", profileError)
        }
      }

      setMessage({
        type: "success",
        text: "Registration successful! Please check your email to confirm your account.",
      })
    } catch (error: any) {
      console.error("Registration error:", error)
      setMessage({
        type: "error",
        text: error.message || "An error occurred during registration",
      })
    } finally {
      setLoading(false)
    }
  }

  const containerStyle: React.CSSProperties = {
    display: "flex",
    minHeight: "100vh",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f9fafb",
    padding: "1rem",
  }

  const cardStyle: React.CSSProperties = {
    width: "100%",
    maxWidth: "28rem",
    backgroundColor: "white",
    borderRadius: "0.5rem",
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    border: "1px solid #e5e7eb",
    overflow: "hidden",
  }

  const headerStyle: React.CSSProperties = {
    padding: "1.5rem",
    borderBottom: "1px solid #e5e7eb",
    textAlign: "center",
  }

  const titleStyle: React.CSSProperties = {
    fontSize: "1.5rem",
    fontWeight: "700",
    color: "#111827",
    marginBottom: "0.5rem",
  }

  const descriptionStyle: React.CSSProperties = {
    color: "#6b7280",
    fontSize: "0.875rem",
  }

  const tabsStyle: React.CSSProperties = {
    display: "flex",
    borderBottom: "1px solid #e5e7eb",
  }

  const tabStyle = (isActive: boolean): React.CSSProperties => ({
    flex: 1,
    textAlign: "center",
    padding: "0.75rem",
    fontWeight: 500,
    color: isActive ? "#2563eb" : "#6b7280",
    borderBottom: isActive ? "2px solid #2563eb" : "none",
    cursor: "pointer",
  })

  const contentStyle: React.CSSProperties = {
    padding: "1.5rem",
  }

  const formGroupStyle: React.CSSProperties = {
    marginBottom: "1rem",
  }

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "0.875rem",
    fontWeight: 500,
    color: "#374151",
    marginBottom: "0.5rem",
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    height: "2.5rem",
    padding: "0.5rem 0.75rem",
    border: "1px solid #d1d5db",
    borderRadius: "0.375rem",
    backgroundColor: "white",
    color: "#1f2937",
    fontSize: "0.875rem",
  }

  const flexBetweenStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  }

  const linkStyle: React.CSSProperties = {
    color: "#2563eb",
    fontSize: "0.875rem",
    textDecoration: "none",
  }

  const buttonStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "2.5rem",
    padding: "0.5rem 1rem",
    backgroundColor: "#2563eb",
    color: "white",
    fontWeight: 500,
    fontSize: "0.875rem",
    borderRadius: "0.375rem",
    border: "none",
    cursor: loading ? "not-allowed" : "pointer",
    opacity: loading ? 0.7 : 1,
  }

  const alertStyle = (type: "success" | "error"): React.CSSProperties => ({
    padding: "0.75rem",
    borderRadius: "0.375rem",
    marginBottom: "1rem",
    backgroundColor: type === "error" ? "#fee2e2" : "#d1fae5",
    color: type === "error" ? "#b91c1c" : "#065f46",
  })

  const radioGroupStyle: React.CSSProperties = {
    marginTop: "0.5rem",
  }

  const radioItemStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    marginBottom: "0.5rem",
  }

  const radioInputStyle: React.CSSProperties = {
    marginRight: "0.5rem",
  }

  const radioLabelStyle: React.CSSProperties = {
    fontSize: "0.875rem",
    color: "#374151",
  }

  const footerStyle: React.CSSProperties = {
    padding: "1.5rem",
    borderTop: "1px solid #e5e7eb",
  }

  return (
    <div style={containerStyle}>
      <div style={{ width: "100%", maxWidth: "28rem" }}>
        {errorParam && (
          <div style={alertStyle("error")}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <AlertTriangle size={16} style={{ marginRight: "0.5rem" }} />
              <span>{decodeURIComponent(errorParam)}</span>
            </div>
          </div>
        )}

        {redirectedFrom && redirectedFrom !== "/dashboard" && (
          <div style={alertStyle("error")}>
            <span>You need to sign in to access {decodeURIComponent(redirectedFrom)}</span>
          </div>
        )}

        <div style={cardStyle}>
          <div style={headerStyle}>
            <h2 style={titleStyle}>SmartPRO</h2>
            <p style={descriptionStyle}>Business Services Hub</p>
          </div>

          <div style={tabsStyle}>
            <div
              style={tabStyle(activeTab === "login")}
              onClick={() => setActiveTab("login")}
              role="button"
              tabIndex={0}
            >
              Login
            </div>
            <div
              style={tabStyle(activeTab === "register")}
              onClick={() => setActiveTab("register")}
              role="button"
              tabIndex={0}
            >
              Register
            </div>
          </div>

          {activeTab === "login" && (
            <form onSubmit={handleLogin}>
              <div style={contentStyle}>
                {message && <div style={alertStyle(message.type)}>{message.text}</div>}

                <div style={formGroupStyle}>
                  <label htmlFor="email" style={labelStyle}>
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={inputStyle}
                  />
                </div>

                <div style={formGroupStyle}>
                  <div style={flexBetweenStyle}>
                    <label htmlFor="password" style={labelStyle}>
                      Password
                    </label>
                    <Link href="/auth/reset-password" style={linkStyle}>
                      Forgot password?
                    </Link>
                  </div>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={footerStyle}>
                <button type="submit" style={buttonStyle} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 size={16} style={{ marginRight: "0.5rem", animation: "spin 1s linear infinite" }} />{" "}
                      Please wait
                    </>
                  ) : (
                    "Sign In"
                  )}
                </button>
              </div>
            </form>
          )}

          {activeTab === "register" && (
            <form onSubmit={handleRegister}>
              <div style={contentStyle}>
                {message && <div style={alertStyle(message.type)}>{message.text}</div>}

                <div style={formGroupStyle}>
                  <label htmlFor="fullName" style={labelStyle}>
                    Full Name
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    style={inputStyle}
                  />
                </div>

                <div style={formGroupStyle}>
                  <label htmlFor="registerEmail" style={labelStyle}>
                    Email
                  </label>
                  <input
                    id="registerEmail"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={inputStyle}
                  />
                </div>

                <div style={formGroupStyle}>
                  <label htmlFor="registerPassword" style={labelStyle}>
                    Password
                  </label>
                  <input
                    id="registerPassword"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    style={inputStyle}
                  />
                </div>

                <div style={formGroupStyle}>
                  <label style={labelStyle}>I am a:</label>
                  <div style={radioGroupStyle}>
                    <div style={radioItemStyle}>
                      <input
                        type="radio"
                        id="client"
                        name="role"
                        value="client"
                        checked={role === "client"}
                        onChange={() => setRole("client")}
                        style={radioInputStyle}
                      />
                      <label htmlFor="client" style={radioLabelStyle}>
                        Client looking for services
                      </label>
                    </div>
                    <div style={radioItemStyle}>
                      <input
                        type="radio"
                        id="provider"
                        name="role"
                        value="provider"
                        checked={role === "provider"}
                        onChange={() => setRole("provider")}
                        style={radioInputStyle}
                      />
                      <label htmlFor="provider" style={radioLabelStyle}>
                        Service Provider
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div style={footerStyle}>
                <button type="submit" style={buttonStyle} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 size={16} style={{ marginRight: "0.5rem", animation: "spin 1s linear infinite" }} />{" "}
                      Please wait
                    </>
                  ) : (
                    "Create Account"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default AuthFormInline
