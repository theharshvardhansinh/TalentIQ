import {
  Sparkles,
  Mail,
  MapPin
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-primary/10 bg-[#0A0E1A] pt-16 pb-8 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Contact Section */}
        <div className="pb-16 mb-16 border-b border-primary/10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-8 text-white">Get in Touch</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="glass-card p-6 rounded-2xl flex flex-col items-center gap-4 hover:bg-primary/5 transition-colors group">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1 text-white">Email Us</h3>
                  <a href="mailto:techtriquetra@gmail.com" className="text-slate-400 hover:text-primary transition-colors">techtriquetra@gmail.com</a>
                </div>
              </div>
              <div className="glass-card p-6 rounded-2xl flex flex-col items-center gap-4 hover:bg-secondary/5 transition-colors group">
                <div className="w-12 h-12 rounded-full bg-secondary/10 text-secondary flex items-center justify-center group-hover:scale-110 transition-transform">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1 text-white">Visit Lab</h3>
                  <p className="text-slate-400">F-Block, Computer Dept.<br />BVM Engineering College</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Creators / Credits Section */}
        <div className="border-t border-primary/10 pt-8 mt-12 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="text-slate-500 text-sm">
            © 2026 Talent IQ. BVM Engineering College. All rights reserved.
          </div>
          <div className="flex flex-col items-center md:items-end gap-1">
            <span className="text-xs uppercase tracking-widest text-slate-500 font-semibold">Crafted with ♥ by</span>
            <div className="flex flex-wrap justify-center gap-2 text-sm text-slate-300 font-medium">
              <span className="hover:text-primary transition-colors cursor-default">Dharmik Kumbhani</span>
              <span className="text-slate-600">&bull;</span>
              <span className="hover:text-primary transition-colors cursor-default">Harshvardhansinh Parmar</span>
              <span className="text-slate-600">&bull;</span>
              <span className="hover:text-primary transition-colors cursor-default">Vrund Patel</span>
            </div>
            <span className="text-[10px] text-primary/60 italic mt-0.5">"Empowering the coding culture of BVM, one challenge at a time."</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
