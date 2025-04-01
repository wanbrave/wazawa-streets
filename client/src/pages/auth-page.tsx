import { useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Building2 } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [_, navigate] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();
  
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Redirect if logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const onLoginSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data);
  };

  const onRegisterSubmit = (data: RegisterFormValues) => {
    registerMutation.mutate(data);
  };

  if (user) {
    return null; // Prevent flash of content before redirect
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col sm:flex-row items-center justify-center p-4">
      <div className="max-w-md w-full mx-auto sm:mr-8">
        <Card className="w-full">
          <CardHeader className="space-y-1 flex flex-col items-center">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-4">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-center">stake</CardTitle>
            <CardDescription className="text-center">
              The smarter way to invest in real estate
            </CardDescription>
          </CardHeader>
          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)}>
                  <CardContent className="space-y-4 pt-4">
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your username" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Enter your password"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                  <CardFooter>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? "Logging in..." : "Login"}
                    </Button>
                  </CardFooter>
                </form>
              </Form>
            </TabsContent>
            <TabsContent value="register">
              <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)}>
                  <CardContent className="space-y-4 pt-4">
                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="Choose a username" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Create a password"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                  <CardFooter>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? "Creating account..." : "Create account"}
                    </Button>
                  </CardFooter>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
      
      <div className="hidden sm:block max-w-md w-full mx-auto mt-8 sm:mt-0 sm:ml-8">
        <div className="bg-white p-8 rounded-lg shadow-sm">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Invest in Premium Real Estate</h2>
          <p className="text-gray-600 mb-6">
            Join thousands of investors already building their real estate portfolio with Stake.
          </p>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-green-100 text-green-800 mr-3">
                ✓
              </div>
              <div>
                <h3 className="font-medium text-gray-800">Curated Properties</h3>
                <p className="text-sm text-gray-600">Access professionally vetted investment opportunities in prime locations</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-green-100 text-green-800 mr-3">
                ✓
              </div>
              <div>
                <h3 className="font-medium text-gray-800">Low Minimum Investment</h3>
                <p className="text-sm text-gray-600">Start with as little as $500 and build a diversified portfolio</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-green-100 text-green-800 mr-3">
                ✓
              </div>
              <div>
                <h3 className="font-medium text-gray-800">Transparent Returns</h3>
                <p className="text-sm text-gray-600">Clear visibility of all costs, risks, and potential returns</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
