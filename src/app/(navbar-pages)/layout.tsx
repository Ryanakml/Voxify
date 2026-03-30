import Footer from "@/components/landings/components/footer";
import Navbar from "@/components/landings/components/navbar";

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <>
            <Navbar />
            {children}
            <Footer />
        </>
    );
}
