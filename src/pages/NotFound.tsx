
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-athletic-light to-white">
      <div className="text-center">
        <div className="mb-8">
          <div className="mx-auto h-20 w-20 athletic-track rounded-full"></div>
        </div>
        <h1 className="text-6xl font-bold text-athletic-primary mb-4">404</h1>
        <p className="text-2xl text-athletic-secondary mb-4">Halaman Tidak Ditemui</p>
        <p className="text-muted-foreground mb-8">
          Maaf, halaman yang anda cari tidak wujud atau telah dipindahkan.
        </p>
        <Link to="/">
          <Button>Kembali ke Halaman Utama</Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
