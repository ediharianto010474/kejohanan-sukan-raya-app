
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';
import { Spinner } from '@/components/ui/spinner';

const Login = () => {
  const { login, register, isLoading } = useAuth();
  const navigate = useNavigate();
  
  const [loginData, setLoginData] = useState({
    username: '',
    password: ''
  });
  
  const [registerData, setRegisterData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRegisterData({
      ...registerData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginData.username || !loginData.password) {
      toast.error('Sila masukkan nama pengguna dan kata laluan');
      return;
    }
    
    const result = await login(loginData.username, loginData.password);
    
    if (result.success) {
      toast.success('Log masuk berjaya!');
      navigate('/event-registration');
    } else {
      toast.error(result.message || 'Log masuk gagal');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!registerData.username || !registerData.password || !registerData.confirmPassword) {
      toast.error('Sila lengkapkan semua maklumat pendaftaran');
      return;
    }
    
    if (registerData.password !== registerData.confirmPassword) {
      toast.error('Kata laluan tidak sepadan');
      return;
    }
    
    const result = await register(registerData.username, registerData.password);
    
    if (result.success) {
      toast.success('Pendaftaran berjaya! Sila log masuk.');
      setRegisterData({ username: '', password: '', confirmPassword: '' });
      // Switch to login tab
      document.getElementById('login-tab')?.click();
    } else {
      toast.error(result.message || 'Pendaftaran gagal');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-athletic-light to-white">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto h-20 w-20 athletic-track rounded-full mb-4"></div>
          <h1 className="text-3xl font-bold text-athletic-secondary">KEJOHANAN OLAHRAGA</h1>
          <p className="text-athletic-accent">Sistem Pengurusan Kejohanan</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Selamat Datang</CardTitle>
            <CardDescription className="text-center">
              Log masuk atau daftar untuk mengakses sistem
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="login" id="login-tab">Log Masuk</TabsTrigger>
                <TabsTrigger value="register">Daftar Akaun</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleLogin}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Nama Pengguna</Label>
                      <Input
                        id="username"
                        name="username"
                        placeholder="Masukkan nama pengguna"
                        value={loginData.username}
                        onChange={handleLoginChange}
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Kata Laluan</Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Masukkan kata laluan"
                        value={loginData.password}
                        onChange={handleLoginChange}
                        disabled={isLoading}
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? <Spinner size="sm" /> : 'Log Masuk'}
                    </Button>
                  </div>
                </form>
              </TabsContent>
              
              <TabsContent value="register">
                <form onSubmit={handleRegister}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="reg-username">Nama Pengguna</Label>
                      <Input
                        id="reg-username"
                        name="username"
                        placeholder="Pilih nama pengguna"
                        value={registerData.username}
                        onChange={handleRegisterChange}
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-password">Kata Laluan</Label>
                      <Input
                        id="reg-password"
                        name="password"
                        type="password"
                        placeholder="Pilih kata laluan"
                        value={registerData.password}
                        onChange={handleRegisterChange}
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Sahkan Kata Laluan</Label>
                      <Input
                        id="confirm-password"
                        name="confirmPassword"
                        type="password"
                        placeholder="Sahkan kata laluan anda"
                        value={registerData.confirmPassword}
                        onChange={handleRegisterChange}
                        disabled={isLoading}
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? <Spinner size="sm" /> : 'Daftar'}
                    </Button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-xs text-muted-foreground">
              Hanya admin boleh mengedit maklumat kejohanan
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
