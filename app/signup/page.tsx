
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import GoogleAuthButton from "@/components/google-auth-button";
import {
  UserRound,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  UserPlus,
} from "lucide-react";

const signupSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    setLoading(true);

    try {
      const { error } = await authClient.signUp.email({
        name: data.name,
        email: data.email,
        password: data.password,
      });

      if (error) {
        toast.error(error.message || "Registration failed.");
        return;
      }

      const response = await fetch("/api/members/me", {
        method: "POST",
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(
          result.message || "Member profile creation failed."
        );
        return;
      }

      toast.success(
        "Registration successful! Waiting for admin approval."
      );

      router.replace("/dashboard");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "h-12 w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-600";

  const fieldClass =
    "flex items-center gap-3 rounded-lg border border-[#292D35] bg-[#0B0D10] px-4 transition focus-within:border-[#CCFF00]";

  const labelClass =
    "mb-2 block text-sm font-medium text-zinc-300";

  const errorClass =
    "mt-1.5 text-xs text-red-400";

  return (
    <main className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-[#0B0D10] px-6 py-14">
      <div className="w-full max-w-lg">

        {/* Heading */}
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#CCFF00] text-[#0B0D10] shadow-[0_0_35px_rgba(204,255,0,0.15)]">
            <UserPlus size={27} strokeWidth={2.5} />
          </div>

          <h1 className="mt-6 text-3xl font-extrabold text-white">
            Create Your Account
          </h1>

          <p className="mt-3 text-sm text-zinc-400">
            Join MessMate and make mess management easier.
          </p>
        </div>

        {/* Signup Card */}
        <div className="rounded-2xl border border-[#292D35] bg-[#12151A] p-7 shadow-2xl shadow-black/30 sm:p-9">

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5"
          >
            {/* Full Name */}
            <div>
              <label className={labelClass}>Full Name</label>

              <div className={fieldClass}>
                <UserRound size={18} className="shrink-0 text-zinc-500" />

                <input
                  {...register("name")}
                  autoComplete="name"
                  placeholder="Enter your full name"
                  className={inputClass}
                />
              </div>

              {errors.name && (
                <p className={errorClass}>{errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className={labelClass}>Email Address</label>

              <div className={fieldClass}>
                <Mail size={18} className="shrink-0 text-zinc-500" />

                <input
                  {...register("email")}
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className={inputClass}
                />
              </div>

              {errors.email && (
                <p className={errorClass}>{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className={labelClass}>Password</label>

              <div className={fieldClass}>
                <LockKeyhole size={18} className="shrink-0 text-zinc-500" />

                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  className={inputClass}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="shrink-0 text-zinc-500 hover:text-[#CCFF00]"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {errors.password && (
                <p className={errorClass}>{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className={labelClass}>Confirm Password</label>

              <div className={fieldClass}>
                <LockKeyhole size={18} className="shrink-0 text-zinc-500" />

                <input
                  {...register("confirmPassword")}
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Re-enter your password"
                  className={inputClass}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  className="shrink-0 text-zinc-500 hover:text-[#CCFF00]"
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>

              {errors.confirmPassword && (
                <p className={errorClass}>
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="flex h-12 w-full items-center justify-center rounded-lg bg-[#CCFF00] font-bold text-[#0B0D10] transition hover:bg-[#b8e600] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3 text-xs text-zinc-600">
            <span className="h-px flex-1 bg-[#292D35]" />
            OR
            <span className="h-px flex-1 bg-[#292D35]" />
          </div>
          <GoogleAuthButton />

          <div className="my-7 border-t border-[#292D35]" />

          <p className="text-center text-sm text-zinc-400">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-[#CCFF00] hover:underline"
            >
              Sign In
            </Link>
          </p>
        </div>

        <p className="mt-7 text-center text-xs text-zinc-600">
          By joining MessMate, you can access your mess information securely.
        </p>
      </div>
    </main>
  );
}
