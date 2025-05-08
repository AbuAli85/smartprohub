import { Suspense } from "react"
import AuthFormInline from "@/components/auth/auth-form-inline"

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            display: "flex",
            minHeight: "100vh",
            width: "100%",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "28rem",
              height: "500px",
              backgroundColor: "#f3f4f6",
              borderRadius: "0.5rem",
            }}
          ></div>
        </div>
      }
    >
      <AuthFormInline type="login" />
    </Suspense>
  )
}
