"use client";
// import { Box, Button, Container, TextField, Typography } from "@mui/material";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLoginUserMutation } from "@/lib/redux/features/auth/authApiSlice";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/lib/redux/hooks/typedHooks";
import { useForm } from "react-hook-form";
import { loginTerramoAdminSchema, TRLoginTerramoAdminSchema } from "@/lib/validationSchemas/LoginSchema";
import  extractErrorMessage from "@/utils/extractErrorMessage";
import { toast } from "react-toastify";
import { setAuth } from "@/lib/redux/features/auth/authSlice";
import { FormFieldComponent } from "@/components/forms/FormFieldComponent";
// import { MailIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Spinner from "@/components/shared/Spinner";
import terramoLogo from "@/../public/assets/images/terramo.svg";
import Image from "next/image";
export default function LoginForm() {
	const [loginTerramoAdmin, { isLoading }] = useLoginUserMutation();
	const router = useRouter();
	const dispatch = useAppDispatch();

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<TRLoginTerramoAdminSchema>({
		resolver: zodResolver(loginTerramoAdminSchema),
		mode: "all",
		defaultValues: {
			email: "",
			password: "",
		},
	});

	const onSubmit = async (values: z.infer<typeof loginTerramoAdminSchema>) => {
		try {
			await loginTerramoAdmin(values).unwrap();
			dispatch(setAuth());
			toast.success("Login Successful");
			router.push("/");
			reset();
		} catch (error) {
			const errorMessage = extractErrorMessage(error);
			console.log('error->', error)
			toast.error(errorMessage || "An error occurred");
		}
	};

	return (
		<main>
			 
			<form
				noValidate
				onSubmit={handleSubmit(onSubmit)}
				className="flex w-full max-w-md flex-col items-center rounded-lg bg-white p-8 shadow-lg"
			>
			
					<Image src={terramoLogo} alt="Terramo Logo" priority width={222}/>
				
				<FormFieldComponent
					label="Email Address"
					name="email"
					register={register}
					errors={errors}
					placeholder="Email Address"
					
				/>

				<FormFieldComponent
					label="Password"
					name="password"
					register={register}
					errors={errors}
					placeholder="Password"
					isPassword={true}
					link={{ linkText: "Forgot Password?", linkUrl: "/forgot-password" }}
				/>
				<Button
					type="submit"
					className="h4-semibold w-full"
					disabled={isLoading}
				>
					{isLoading ? <Spinner size="sm" /> : `Sign In`}
				</Button>
			</form>
		</main>
	);
}

