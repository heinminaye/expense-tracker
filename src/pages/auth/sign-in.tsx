import React, { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import useStore from "../../store";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from 'sonner'
import Input from "../../components/input";
import Button from "../../components/button";
import api from "../../libs/api";

const SignInSchema = zod.object({
  user_id: zod
    .string({ required_error: "Email is required" })
    .min(1, { message: "Email is required" })
    .email({ message: "Invalid email address" }),
  password: zod
    .string({ required_error: "Password is required" })
    .min(1, "Password is required"),
});

function SignIn() {
  const { user, setCredentails } = useStore((state) => state);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(SignInSchema),
  });

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  // const fakeApiPost = (url, data) => {
  //   return new Promise((resolve) => {
  //     setTimeout(() => {
  //       if (data.username === 'admin' && data.password === 'password123') {
  //         resolve({
  //           data: {
  //             returncode: '200', 
  //             message: 'Login successful!',
  //             data: {
  //               user_id: 'admin@gmail.com',
  //             },
  //             token: 'fakeJwtToken123',
  //           },
  //         });
  //       } else {
  //         resolve({
  //           data: {
  //             returncode: '400',
  //             message: 'Invalid username or password',
  //           },
  //         });
  //       }
  //     }, 1000); 
  //   });
  // };

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const { data: response } = await api.post('/auth/signin', data);
      // const { data: response } = await fakeApiPost('/auth/signin', data);
      console.log(response)
      if (response.returncode == '200') {
        toast.success(response.message)
        localStorage.setItem("user", response.data['user_id']);
        localStorage.setItem("token", response.token);
        setCredentails(response.data['user_id'],response.token);
        setTimeout(() => {
          reset();
          navigate("/");
        }, 2000);
      } else {
        toast.error(response.message)
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setLoading(false);
    }
  };

  // Password Eye Toggle
  const [passwordVisible, setPasswordVisible] = useState(false);
  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center h-96">
        <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-md">
          <header className="text-left mb-6">
            <h2 className="text-2xl font-medium">Sign In to Your Account</h2>
            <p className="mt-2 text-sm text-gray-500">
              Let’s get you signed in!
            </p>
          </header>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Input label="Email" type="text" name="user_id" disabled={loading} register={register} error={errors.user_id} />

            <div className="mb-3">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative mt-1">
                <input
                  type={passwordVisible ? 'text' : 'password'}
                  id="password"
                  {...register("password")}
                  name="password"
                  disabled={loading}
                  className="block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                >
                  {passwordVisible ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div className="mb-6">
              <div className="text-right">
                <a href="#" className="text-sm text-blue-500 hover:underline">
                  Forgot your password?
                </a>
              </div>
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? "Signing In..." : "Sign In"}
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}

export default SignIn;
