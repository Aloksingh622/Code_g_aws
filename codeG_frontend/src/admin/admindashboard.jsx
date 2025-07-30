import React, { useEffect } from "react";
import { Link } from "react-router";
import { Users, Plus, Edit, Trash2, BarChart3, TrendingUp, Puzzle, UserCheck, Video, Trophy } from "lucide-react";
import RotatingText from "../animations/rotatingtext";
import Particles from "@/components/ui/particlebg";
import AOS from 'aos';
import 'aos/dist/aos.css';

export default function AdminDashboard() {
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: false,
    });
  }, []);

  const adminCards = [
    {
      title: "Create Problem",
      description: "Design and add a new coding challenge to the platform.",
      icon: Plus,
      color: "bg-primary/10 text-primary",
      buttonClass: "btn-primary",
      link: "/admin/problems/create",
      buttonText: "Create New"
    },
    {
      title: "Manage Contest",
      description: "Create, edit, and monitor coding contests for your users.",
      icon: Trophy,
      color: "bg-purple-500/10 text-purple-500",
      buttonClass: "bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600",
      link: "/admin/contest",
      buttonText: "Manage"
    }

    ,
    {
      title: "Edit Problems",
      description: "Modify, update, and refine existing coding problems.",
      icon: Edit,
      color: "bg-secondary/10 text-secondary",
      buttonClass: "btn-secondary",
      link: "/admin/update",
      buttonText: "Edit Problems"
    },
    {
      title: "Video Library",
      description: "Manage educational content, tutorials, and video resources.",
      icon: Video,
      color: "bg-accent/10 text-accent",
      buttonClass: "btn-accent",
      link: "/admin/video",
      buttonText: "Browse Library"
    },
    {
      title: "Manage Users",
      description: "Oversee user roles, permissions, and platform access.",
      icon: UserCheck,
      color: "bg-info/10 text-info",
      buttonClass: "btn-info",
      link: "/admin/users",
      buttonText: "Manage Users"
    },

    {
      title: "Delete Content",
      description: "Remove outdated or incorrect problems from the live set.",
      icon: Trash2,
      color: "bg-error/10 text-error",
      buttonClass: "btn-error",
      link: "/admin/problems/delete",
      buttonText: "Manage"
    },


  ];

  const quickStats = [
    { label: "Total Problems", value: "20", icon: Puzzle, color: "text-primary" },
    { label: "Active Users", value: "15", icon: UserCheck, color: "text-success" },
    { label: "Success Rate", value: "89%", icon: TrendingUp, color: "text-accent" },
    { label: "New Users Today", value: "4", icon: Users, color: "text-info" }
  ];

  return (
    <div className="relative min-h-screen bg-base-100 p-4 sm:p-8 overflow-hidden">
      {}

      <div className="fixed inset-0 z-9 pointer-events-none from-sky-100 via-violet-100 to-pink-100 dark:from-slate-800 dark:via-neutral-900 dark:to-slate-600 p-4 transition-colors ">

      </div>
      <div className="absolute inset-0 z-100 pointer-events-none">
        <Particles
          particleColors={['#ffffff', '#ffffff']}
          particleCount={180}
          particleSpread={10}
          speed={0.1}
          particleBaseSize={100}
          moveParticlesOnHover={true}
          alphaParticles={false}
          disableRotation={false}
        />
        <div className="absolute bottom-0 left-[-20%] right-0 top-[-10%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(var(--color-primary),0.1),transparent)]"></div>
        <div className="absolute bottom-0 right-[-20%] top-[-10%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(var(--color-accent),0.1),transparent)]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-16">
        {}
        <div className="text-center space-y-3 pt-10" data-aos="fade-down">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <RotatingText
            texts={['Manage your coding platform', 'Create new challenges', 'Monitor user activity', 'Analyze platform growth']}
            mainClassName="text-base-content/70 font-medium text-base sm:text-lg flex justify-center"
            staggerDuration={0.03}
            rotationInterval={4000}
          />
        </div>

        {}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div
                key={card.title}
                className="group relative"
                data-aos="fade-up"
                data-aos-delay={index * 50}
              >
                {}
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-xl blur-sm opacity-10 group-hover:opacity-30 transition-all duration-300"></div>

                {}
                <div className="relative card bg-base-100/70 backdrop-blur-md shadow-xl border border-base-300/20 transition-all duration-300 hover:-translate-y-1">
                  <div className="card-body">
                    <div className={`p-3 rounded-xl self-start ${card.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h2 className="card-title text-xl font-bold mt-4">{card.title}</h2>
                    <p className="text-base-content/70 text-sm">{card.description}</p>
                    <div className="card-actions justify-end mt-4">
                      <Link to={card.link} className={`btn ${card.buttonClass} btn-sm text-white`}>
                        {card.buttonText}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {}
        <div
          className="card bg-base-100/70 backdrop-blur-md shadow-2xl border border-base-300/20"
          data-aos="fade-up"
          data-aos-delay="100"
        >
          <div className="card-body">
            <h2 className="card-title text-2xl font-bold text-center sm:text-left mb-6">
              📊 Platform Quick-Stats
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {quickStats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="text-center p-4 rounded-lg bg-base-200/50 hover:bg-base-200 transition-colors">
                    <Icon className={`w-8 h-8 mx-auto mb-3 ${stat.color}`} />
                    <div className={`text-4xl font-bold ${stat.color}`}>{stat.value}</div>
                    <div className="text-sm text-base-content/70 mt-1">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
      
              <footer className="relative z-10 border-t border-base-300/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-12">
      
                  {}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
      
                    {}
                    <div className="lg:col-span-1" data-aos="fade-up">
                      <h3 className="text-2xl font-bold">Ready to Start Your Journey?</h3>
                      <p className="mt-2 text-base-content/70">
                        Create an account to track your progress, save problems, and join the best community of developers.
                      </p>
                      <div className="mt-6">
                        <Link to="/register" className="btn btn-primary btn-wide">
                          Get Started for Free
                        </Link>
                      </div>
                    </div>
      
                    {}
                    <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-8" data-aos="fade-up" data-aos-delay="100">
                      <div>
                        <h4 className="font-semibold text-base-content mb-3">Product</h4>
                        <ul className="space-y-2">
                          <li><Link to="/problems" className="link link-hover text-base-content/70">Problems</Link></li>
                          <li><Link to="/problem/potd" className="link link-hover text-base-content/70">Daily Challenge</Link></li>
                          <li><Link to="/pricing" className="link link-hover text-base-content/70">Pricing</Link></li>
                          <li><Link to="/discussion" className="link link-hover text-base-content/70">Discussions</Link></li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-base-content mb-3">Company</h4>
                        <ul className="space-y-2">
                          <li><a href="#" className="link link-hover text-base-content/70">About Us</a></li>
                          <li><a href="#" className="link link-hover text-base-content/70">Careers</a></li>
                          <li><a href="#" className="link link-hover text-base-content/70">Contact</a></li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-base-content mb-3">Resources</h4>
                        <ul className="space-y-2">
                          <li><a href="#" className="link link-hover text-base-content/70">Blog</a></li>
                          <li><a href="#" className="link link-hover text-base-content/70">Help Center</a></li>
                          <li><a href="#" className="link link-hover text-base-content/70">Sitemap</a></li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-base-content mb-3">Legal</h4>
                        <ul className="space-y-2">
                          <li><a href="#" className="link link-hover text-base-content/70">Privacy Policy</a></li>
                          <li><a href="#" className="link link-hover text-base-content/70">Terms of Service</a></li>
                        </ul>
                      </div>
                    </div>
      
                  </div>
      
                  {}
                  <div className="mt-12 pt-8 border-t border-base-300/50 flex flex-col sm:flex-row justify-between items-center">
                    <p className="text-sm text-base-content/60 text-center sm:text-left">
                      © {new Date().getFullYear()} CodeG. All Rights Reserved.
                    </p>
                    <div className="flex items-center gap-4 mt-4 sm:mt-0">
                      <a href="#" className="text-base-content/70 hover:text-primary transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.91 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                      </a>
                      <a href="#" className="text-base-content/70 hover:text-primary transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.85s-.011 3.585-.069 4.85c-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07s-3.585-.012-4.85-.07c-3.252-.148-4.771-1.691-4.919-4.919-.058-1.265-.07-1.645-.07-4.85s.012-3.585.07-4.85c.148-3.225 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.85-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948s.014 3.667.072 4.947c.2 4.358 2.618 6.78 6.98 6.98 1.281.059 1.689.073 4.948.073s3.667-.014 4.947-.072c4.358-.2 6.78-2.618 6.98-6.98.059-1.281.073-1.689.073-4.948s-.014-3.667-.072-4.947c-.2-4.358-2.618-6.78-6.98-6.98-1.281-.059-1.689-.073-4.948-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4s1.791-4 4-4 4 1.79 4 4-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.441 1.441 1.441 1.441-.645 1.441-1.441-.645-1.44-1.441-1.44z" /></svg>
                      </a>
                      <a href="#" className="text-base-content/70 hover:text-primary transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616v.064c0 2.295 1.616 4.22 3.765 4.664-.715.192-1.472.22-2.21.084.613 1.942 2.38 3.352 4.484 3.388-1.703 1.332-3.834 2.052-6.143 2.052-.4 0-.79-.023-1.17-.067 2.206 1.408 4.832 2.224 7.656 2.224 9.172 0 14.288-7.753 13.945-14.656.974-.698 1.82-1.572 2.486-2.584z" /></svg>
                      </a>
                    </div>
                  </div>
                </div>
              </footer>
      
    </div>
  );
}
