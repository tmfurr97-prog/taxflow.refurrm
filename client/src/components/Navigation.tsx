import { Link, useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, Building2, Shield, Bitcoin, Receipt, 
  CreditCard, User, LogOut, Menu, X, Send, Database 
} from 'lucide-react';


import { useState } from 'react';

export default function Navigation() {
  const { user, signOut } = useAuth();
  const [location] = useLocation();
  const [, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    setLocation('/login');
  };

  const isActive = (path: string) => location === path;

  const publicLinks = [
    { path: '/features', label: 'Features' },
    { path: '/pricing', label: 'Pricing' },
    { path: '/blog', label: 'Blog' },
    { path: '/terms', label: 'Terms' },
    { path: '/privacy', label: 'Privacy' },
  ];


  const protectedLinks = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/efile', label: 'E-File', icon: Send },
    { path: '/entities', label: 'Business Entities', icon: Building2 },
    { path: '/audit-defense', label: 'Audit Defense', icon: Shield },
    { path: '/crypto', label: 'Crypto Taxes', icon: Bitcoin },
    { path: '/receipts', label: 'Receipts', icon: Receipt },
    { path: '/backups', label: 'Backups', icon: Database },
    { path: '/subscriptions', label: 'Subscriptions', icon: CreditCard },
  ];



  return (
    <nav className="bg-white border-b border-teal/20 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-3">
            <img src="https://d64gsuwffb70l.cloudfront.net/68e7f2c7e795b22e67db6507_1762416633888_fefd0c10.webp" alt="TaxFlow" className="h-10 w-10" />
            <div>
              <Link href="/" className="text-2xl font-heading font-bold text-teal">TaxFlow</Link>
              <p className="text-xs text-muted-foreground">by SmartBooks Academy</p>
            </div>
          </div>


          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {!user ? (
              <>
                {publicLinks.map(link => (
                  <Link key={link.path} to={link.path} className="text-charcoal hover:text-teal transition-colors">{link.label}</Link>
                ))}
                <Link href="/login"><Button variant="ghost" className="text-charcoal hover:text-teal">Login</Button></Link>
                <Link href="/signup"><Button className="bg-teal hover:bg-teal-dark text-charcoal font-semibold">Sign Up</Button></Link>
              </>
            ) : (
              <>
                {protectedLinks.map(link => (
                  <Link key={link.path} to={link.path} className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${isActive(link.path) ? 'bg-teal/10 text-teal' : 'text-charcoal hover:bg-teal/5'}`}>
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                ))}
                <Link href="/profile"><Button variant="ghost" className="text-charcoal hover:text-teal"><User className="h-4 w-4 mr-2" />Profile</Button></Link>
                <Button variant="ghost" onClick={handleSignOut} className="text-charcoal hover:text-teal"><LogOut className="h-4 w-4" /></Button>

              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-gray-700">
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {!user ? (
              <>
                {publicLinks.map(link => (
                  <Link key={link.path} to={link.path} className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md" onClick={() => setMobileMenuOpen(false)}>{link.label}</Link>
                ))}
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}><Button variant="ghost" className="w-full justify-start">Login</Button></Link>
                <Link href="/signup" onClick={() => setMobileMenuOpen(false)}><Button className="w-full">Sign Up</Button></Link>
              </>
            ) : (
              <>
                {protectedLinks.map(link => (
                  <Link key={link.path} to={link.path} className={`flex items-center gap-2 px-3 py-2 rounded-md ${isActive(link.path) ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}`} onClick={() => setMobileMenuOpen(false)}>
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                ))}
                <Link href="/profile" onClick={() => setMobileMenuOpen(false)}><Button variant="ghost" className="w-full justify-start"><User className="h-4 w-4 mr-2" />Profile</Button></Link>
                <Button variant="ghost" onClick={() => { handleSignOut(); setMobileMenuOpen(false); }} className="w-full justify-start"><LogOut className="h-4 w-4 mr-2" />Sign Out</Button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
