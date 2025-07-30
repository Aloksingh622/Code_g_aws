import React, { useEffect, useState } from 'react';
import { Link } from "react-router";
import RobotModel from '@/component/robot3d';
import { useSelector } from 'react-redux';
import LightRays from '../components/ui/lightraybg';
import Particles from '@/components/ui/particlebg';
import AOS from 'aos';
import 'aos/dist/aos.css';

const ArrowIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
  </svg>
);

const CodeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
  </svg>
);

const HomePage = () => {
  const user = useSelector((state) => state.auth.user);

  const StyledCodeG = () => (
    <span className='font-bold bg-gradient-to-r from-[#6b10e2e8] via-[#a310e2d7] to-[#e210ded7]  dark:bg-gradient-to-r dark:from-[#10e2d4d7] dark:via-[#10b4e2d7] dark:to-[#106be2d7] bg-clip-text text-transparent'>
      CodeG
    </span>
  );

  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const updateTheme = () => {
      const theme = document.documentElement.getAttribute('data-theme');
      setIsDark(theme?.includes('dark') || theme === 'dark');
    };

    updateTheme();
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: false,
    });
  }, []);

  return (
    <>
      {}
      <div className="fixed inset-0 z-9 pointer-events-none from-sky-100 via-violet-100 to-pink-100 dark:from-slate-800 dark:via-neutral-900 dark:to-slate-600 p-4 transition-colors ">
        <LightRays
          raysOrigin="top-center"
          raysColor={isDark ? '#00ffff' : '#FD3DB5'}
          raysSpeed={1.5}
          lightSpread={isDark ? 0.8 : 0.5}
          rayLength={isDark ? 1.2 : 0.4}
          followMouse={true}
          mouseInfluence={0.1}
          noiseAmount={isDark ? 0.1 : 0.04}
          distortion={isDark ? 0.05 : 0.02}
          className="absolute inset-0 w-full h-full"
        />
      </div>

      <div className="fixed inset-0 z-9 pointer-events-none from-sky-100 via-violet-100 to-pink-100 dark:from-slate-800 dark:via-neutral-900 dark:to-slate-600 p-4 transition-colors ">
        <Particles
          particleColors={isDark ? ['#ffffff', '#ffffff'] : ['#FD3DB5', '#666666']}
          particleCount={180}
          particleSpread={10}
          speed={0.1}
          particleBaseSize={isDark ? 100 : 60}
          moveParticlesOnHover={true}
          alphaParticles={false}
          disableRotation={false}
        />
      </div>

      <div className="min-h-screen from-sky-100 via-violet-100 to-pink-100 dark:from-slate-800 dark:via-neutral-900 dark:to-slate-600 p-4 transition-colors overflow-hidden">
        <section className="relative z-10 flex items-center justify-center from-sky-100 via-violet-100 to-pink-100 dark:from-slate-800 dark:via-neutral-900 dark:to-slate-600 p-4 transition-colors">
          <main className="relative from-sky-100 via-violet-100 to-pink-100 dark:from-slate-800 dark:via-neutral-900 dark:to-slate-600 p-4 transition-colors flex flex-col lg:flex-row items-center justify-between m-auto w-full px-4 sm:px-6 lg:px-12 xl:px-20 2xl:px-32 min-h-screen gap-8 sm:gap-10">

            {}
            <div className="z-10 lg:w-1/2 w-full flex justify-center lg:justify-start p-4 sm:p-6 md:p-8 lg:p-6 xl:p-8">
              <div className="text-center lg:text-left max-w-full sm:max-w-xl lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl">
                <h1
                  className="text-4xl sm:text-5xl md:text-6xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-black leading-tight tracking-tight animate-fade-in-down"
                  data-aos="fade-up"
                >
                  Hey,
                  <span className="block bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                    {user ? user.first_name : 'CodeSmith'}
                  </span>
                </h1>

                <p
                  className="mt-8 text-base sm:text-lg md:text-xl lg:text-lg xl:text-xl text-base-content/70 leading-relaxed animate-fade-in-up"
                  data-aos="fade-up"
                  data-aos-delay="200"
                >
                  {user ? (
                    <>
                      Ready to crush your next tech interview? Dive into our collection of algorithm problems and level up your skills today with <StyledCodeG />.
                    </>
                  ) : (
                    <>
                      Sign up or log in to <StyledCodeG /> to start solving problems and track your progress!
                    </>
                  )}
                </p>

                <div
                  className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mt-8 pt-4 animate-fade-in-up"
                  data-aos="fade-up"
                  data-aos-delay="400"
                >
                  <Link
                    to="/problems"
                    className="btn btn-primary btn-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 group"
                  >
                    <CodeIcon />
                    Start Coding
                    <ArrowIcon />
                  </Link>
                </div>
              </div>
            </div>

            {}
            <div
              className="lg:w-1/2 w-full relative left-40 top-10 flex items-center justify-center lg:justify-start xl:justify-center pointer-events-none lg:pointer-events-auto mt-8 lg:mt-0 lg:mb-16 xl:mb-20 lg:mr-8 xl:mr-12 scale-[1.0] sm:scale-[1.1] md:scale-[1.2] lg:scale-[1.2] xl:scale-[1.3] 2xl:scale-[2.0]"
              data-aos="fade-left"
              data-aos-delay="600"
            >
              <RobotModel />
            </div>
          </main>
        </section>
 <section className="relative z-10 py-12 sm:py-16 lg:py-24 xl:py-32">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-stretch">

    {}
    <div className="flex" data-aos="fade-up" data-aos-delay="100">
      <div className="relative max-w-full sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto group flex-1">

        {}
        <div className="absolute -inset-6 bg-gradient-to-r from-primary/30 via-accent/20 to-secondary/30 rounded-3xl blur-3xl opacity-60 group-hover:opacity-90 transition-all duration-700 animate-pulse" data-aos="fade-up" data-aos-delay="150"></div>
        <div className="absolute -inset-3 bg-gradient-to-r from-primary/25 to-secondary/25 rounded-2xl blur-xl opacity-40 group-hover:opacity-60 transition-all duration-500" data-aos="fade-up" data-aos-delay="175"></div>
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl blur-sm opacity-30" data-aos="fade-up" data-aos-delay="200"></div>

        {}
        <div className="relative bg-gradient-to-br from-base-100/95 via-base-100/90 to-base-200/80 backdrop-blur-xl shadow-2xl rounded-2xl p-6 border border-base-300/50 space-y-5 hover:shadow-3xl hover:scale-[1.02] transition-all duration-500 overflow-hidden h-full flex flex-col">

          {}
          <div className="absolute inset-0 opacity-5" data-aos="fade-up" data-aos-delay="225">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/20 via-transparent to-secondary/20 rounded-2xl"></div>
            <div className="absolute top-4 right-4 w-20 h-20 bg-primary/10 rounded-full blur-2xl animate-pulse"></div>
            <div className="absolute bottom-6 left-6 w-16 h-16 bg-secondary/10 rounded-full blur-xl animate-pulse delay-1000"></div>
          </div>

          {}
          <div className="relative flex justify-between items-start" data-aos="fade-up" data-aos-delay="250">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center border border-primary/30">
                  <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-base-content group-hover:text-primary transition-colors duration-300">
                    CodeG Coding Clash
                  </h3>
                  <p className="text-xs text-base-content/60 font-medium">International Championship</p>
                </div>
              </div>
            </div>

            {}
            <div className="relative">
              <div className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-400 text-xs font-bold px-3 py-2 rounded-full border border-emerald-400/30 shadow-lg backdrop-blur-sm">
                <div className="relative flex items-center">
                  <span className="animate-ping absolute w-2 h-2 bg-emerald-400 rounded-full opacity-75"></span>
                  <span className="relative w-2 h-2 bg-emerald-400 rounded-full shadow-lg"></span>
                </div>
                <span className="tracking-wide">LIVE</span>
              </div>
            </div>
          </div>

          {}
          <div className="relative grid grid-cols-2 gap-4" data-aos="fade-up" data-aos-delay="300">
            <div className="group/stat bg-gradient-to-br from-base-200/80 via-base-200/60 to-base-300/40 p-4 rounded-xl border border-base-300/30 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover/stat:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-base-content/70 uppercase tracking-wide">Problems</p>
                <div className="w-6 h-6 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center group-hover/stat:scale-110 transition-transform duration-300">
                  <svg className="w-3 h-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <p className="text-2xl font-black text-primary group-hover/stat:text-primary/80 transition-colors duration-300">5</p>
            </div>

            <div className="group/stat bg-gradient-to-br from-base-200/80 via-base-200/60 to-base-300/40 p-4 rounded-xl border border-base-300/30 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover/stat:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-base-content/70 uppercase tracking-wide">Participants</p>
                <div className="w-6 h-6 bg-gradient-to-br from-secondary/20 to-secondary/10 rounded-lg flex items-center justify-center group-hover/stat:scale-110 transition-transform duration-300">
                  <svg className="w-3 h-3 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <div className="flex items-baseline space-x-1">
                <p className="text-2xl font-black text-secondary group-hover/stat:text-secondary/80 transition-colors duration-300">128</p>
                <span className="text-xs text-emerald-500 font-bold">+12</span>
              </div>
            </div>
          </div>

          {}
          <div className="relative bg-gradient-to-r from-warning/15 via-orange/10 to-error/15 p-4 rounded-xl border border-warning/30 backdrop-blur-sm overflow-hidden" data-aos="fade-up" data-aos-delay="400">
            <div className="absolute inset-0 bg-gradient-to-r from-warning/5 to-error/5 opacity-50"></div>

            <div className="relative flex justify-between items-center mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 bg-gradient-to-br from-warning/30 to-orange/20 rounded-lg flex items-center justify-center border border-warning/40">
                  <svg className="w-4 h-4 text-warning animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-xs font-bold text-base-content/90 uppercase tracking-wide">Time Remaining</span>
              </div>
              <span className="text-lg font-mono font-black text-warning drop-shadow-sm animate-pulse">01:24:15</span>
            </div>

            {}
            <div className="relative">
              <div className="w-full bg-base-300/50 rounded-full h-3 overflow-hidden backdrop-blur-sm">
                <div className="relative h-full">
                  <div
                    className="h-full bg-gradient-to-r from-warning via-orange-400 to-error rounded-full transition-all duration-1000 ease-out shadow-lg"
                    style={{ width: '40%' }}
                  ></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>

          {}
          <div className="relative flex items-center justify-between bg-gradient-to-r from-accent/10 to-primary/10 p-4 rounded-xl border border-accent/20 mt-auto" data-aos="fade-up" data-aos-delay="500">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-accent/30 to-primary/20 rounded-lg flex items-center justify-center border border-accent/40">
                <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold text-base-content/70">Prize Pool</p>
                <p className="text-lg font-black text-accent">$2,500</p>
              </div>
            </div>
            <button className="bg-gradient-to-r from-primary to-accent px-6 py-2 rounded-lg text-white font-bold text-sm hover:shadow-lg hover:scale-105 transition-all duration-300 group/btn">
              <span className="flex items-center space-x-1">
                <span>Join Now</span>
                <svg className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </button>
          </div>

        </div>
      </div>
    </div>

    {}
    <div className="text-center lg:text-left flex flex-col justify-center" data-aos="fade-up" data-aos-delay="200">
      <div>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary font-medium text-sm mb-6" data-aos="fade-up" data-aos-delay="300">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
          Live Competition
        </div>
        
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight" data-aos="fade-up" data-aos-delay="400">
          Compete in{' '}
          <span className="relative">
            <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              Live Contests
            </span>
            <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-primary/30 via-accent/30 to-secondary/30 rounded-full"></div>
          </span>
        </h2>
        
        <p className="mt-6 text-lg text-base-content/70 leading-relaxed" data-aos="fade-up" data-aos-delay="500">
          Challenge yourself in a real-time, competitive environment. Solve problems against the clock and climb the leaderboard to{' '}
          <span className="text-base-content/90 font-medium">prove your skills.</span>
        </p>
        
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start" data-aos="fade-up" data-aos-delay="600">
          <Link to="/contest" className="group btn btn-primary btn-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Browse All Contests
          </Link>
          
          <button className="btn btn-outline btn-lg hover:btn-ghost transition-colors duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            View Leaderboard
          </button>
        </div>
      </div>
    </div>

  </div>
</section>
<section className="relative z-10 py-12 sm:py-16 lg:py-24 xl:py-32 overflow-hidden">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

    {}
    <div className="text-center lg:text-left" data-aos="fade-up" data-aos-delay="100">
      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight" data-aos="fade-up" data-aos-delay="200">
        Code Together in <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Real-Time</span>
      </h2>
      <p className="mt-4 text-lg text-base-content/70" data-aos="fade-up" data-aos-delay="300">
        Team up with a partner, tackle complex problems, and learn from each other in a live, shared editor. Features real-time code-sync, cursor sharing, and integrated voice chat.
      </p>
      <div className="mt-8" data-aos="fade-up" data-aos-delay="400">
        <Link to="/pair-mode" className="btn btn-primary btn-lg shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
          </svg>
          Start a Collab Session
        </Link>
      </div>
    </div>

    {}
    <div data-aos="fade-up" data-aos-delay="200">
      <div className="relative max-w-full sm:max-w-lg md:max-w-xl lg:max-w-2xl">
        <div className="absolute -inset-4 bg-gradient-to-r from-accent/20 to-primary/20 rounded-2xl blur-2xl opacity-80" data-aos="fade-up" data-aos-delay="250"></div>

        {}
        <div className="absolute -top-5 -left-5 z-20" data-aos="fade-up" data-aos-delay="300">
          <div className="avatar indicator">
            <span className="indicator-item badge badge-success badge-xs"></span>
            <div className="w-12 h-12 rounded-full ring-2 ring-primary ring-offset-base-100 ring-offset-2">
              {
                user ? <img src={user.profile_pic_url} alt="user" /> :
                  <img src="https://api.dicebear.com/7.x/initials/svg?seed=JD" alt="user" />
              }
            </div>
          </div>
        </div>
        <div className="absolute -top-5 -right-5 z-20" data-aos="fade-up" data-aos-delay="350">
          <div className="avatar indicator">
            <span className="indicator-item badge badge-success badge-xs"></span>
            <div className="w-12 h-12 rounded-full ring-2 ring-accent ring-offset-base-100 ring-offset-2">
              <img src="https://drop.ndtv.com/albums/SPORTS/top-5-indian-sp_638705754632632253/638705754655810253.jpeg" alt="Collaborator 2" />
            </div>
          </div>
        </div>

        <div className="relative mockup-code bg-base-100/95 backdrop-blur-sm shadow-2xl text-xs sm:text-sm border border-base-300" data-aos="fade-up" data-aos-delay="400">
          <pre data-prefix="1"><code><span className="text-purple-600">function</span> <span className="text-blue-600">mergeIntervals</span>(intervals) {'{'}</code></pre>
          <pre data-prefix="2" className="bg-primary/10">
            <code>  <span className="text-gray-500">{`// User1 is typing...`}</span> </code>
            <span className="bg-primary animate-pulse w-0.5 h-4 inline-block ml-1" />
          </pre>
          <pre data-prefix="3"><code>  intervals.sort((a, b) = a.start - b.start);</code></pre>
          <pre data-prefix="4"><code>  </code></pre>
          <pre data-prefix="5"><code>  <span className="text-purple-600">const</span> merged = [intervals[0]];</code></pre>
          <pre data-prefix="6" className="bg-accent/10">
            <code>  <span className="text-purple-600">for</span> (let i = 1; i {'<'} intervals.length; i++) {'{'}</code>
            <span className="bg-accent animate-pulse w-0.5 h-4 inline-block ml-1" />
          </pre>
          <pre data-prefix="7"><code>    <span className="text-purple-600">...</span></code></pre>
          <pre data-prefix="8"><code>  {'}'}</code></pre>
          <pre data-prefix="9" className="text-success"><code>  <span className="text-purple-600">return</span> merged;</code></pre>
          <pre data-prefix="10"><code>{'}'}</code></pre>
        </div>

        {}
        <div className="absolute -bottom-4 left-4 flex items-center gap-2" data-aos="fade-up" data-aos-delay="450">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-error"></span>
          </span>
          <span className="text-error font-semibold text-sm">LIVE</span>
        </div>
        <div className="absolute -bottom-4 right-4 flex items-center gap-2 bg-base-300/50 backdrop-blur-sm px-3 py-1 rounded-full text-xs" data-aos="fade-up" data-aos-delay="500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
          <span className="font-semibold text-success">Voice ON</span>
        </div>
      </div>
    </div>

  </div>
</section>
<section className="relative z-10 py-12 sm:py-16 lg:py-24 xl:py-32">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
    {}
    <div data-aos="fade-up" data-aos-delay="100">
      <div className="relative max-w-full sm:max-w-lg md:max-w-xl lg:max-w-2xl">
        <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl blur-2xl opacity-75" data-aos="fade-up" data-aos-delay="150"></div>
        <div className="relative mockup-code bg-base-100/95 backdrop-blur-sm shadow-2xl text-xs sm:text-sm border border-base-300" data-aos="fade-up" data-aos-delay="200">
          <pre data-prefix="1"><code><span className="text-purple-600">function</span> <span className="text-blue-600">twoSum</span>(nums, target) {'{'}</code></pre>
          <pre data-prefix="2"><code>  <span className="text-purple-600">const</span> map = <span className="text-purple-600">new</span> <span className="text-green-500">Map</span>();</code></pre>
          <pre data-prefix="4"><code>  <span className="text-purple-600">for</span> (...) {'{'}</code></pre>
          <pre data-prefix="6"><code>    <span className="text-purple-600">if</span> (map.has(complement)) {'{'}</code></pre>
          <pre data-prefix="7" className="text-success"><code>      return [map.get(complement), i];</code></pre>
          <pre data-prefix="8"><code>    {'}'}</code></pre>
          <pre data-prefix="9"><code>    map.set(nums[i], i);</code></pre>
          <pre data-prefix="10"><code>  {'}'}</code></pre>
          <pre data-prefix="11"><code>{'}'}</code></pre>
        </div>
        <div className="absolute -top-3 -right-3 bg-success text-success-content px-3 py-1 rounded-full text-xs font-semibold shadow-lg" data-aos="fade-up" data-aos-delay="250">
          ✓ Solved
        </div>
      </div>
    </div>

    {}
    <div className="text-center lg:text-left" data-aos="fade-up" data-aos-delay="200">
      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight" data-aos="fade-up" data-aos-delay="300">
        Solve the <span className="bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">Daily Challenge</span>
      </h2>
      <p className="mt-4 text-lg text-base-content/70" data-aos="fade-up" data-aos-delay="400">
        A new problem is featured every day. Test your skills, compare solutions with the community, and earn points for your consistency.
      </p>
      <div className="mt-8" data-aos="fade-up" data-aos-delay="500">
        <Link to="/problem/potd" className="btn btn-outline btn-secondary btn-lg">
          View Today's Challenge
        </Link>
      </div>
    </div>
  </div>
</section>
{}
<section className="relative z-10 py-16 sm:py-20 lg:py-28 xl:py-32">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

    {}
    <div className="text-center lg:text-left" data-aos="fade-up" data-aos-delay="100">
      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight" data-aos="fade-up" data-aos-delay="200">
        Ask. Answer. <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Grow Together</span>
      </h2>
      <p className="mt-4 text-lg text-base-content/70" data-aos="fade-up" data-aos-delay="300">
        Got a doubt? Share it with the community. Someone’s always there to help. Learn faster through real conversations.
      </p>
      <div className="mt-8" data-aos="fade-up" data-aos-delay="400">
        <Link to="/discussion" className="btn btn-outline btn-accent btn-lg">
          Join Discussion
        </Link>
      </div>
    </div>
    {}
    <div className="relative group" data-aos="fade-up" data-aos-delay="200">
      {}
      <div className="absolute -inset-1.5 bg-gradient-to-r from-primary to-secondary rounded-xl blur opacity-30 group-hover:opacity-75 transition duration-500" data-aos="fade-up" data-aos-delay="250"></div>

      <div className="relative bg-base-100 shadow-xl border border-base-300 rounded-xl p-6 space-y-4" data-aos="fade-up" data-aos-delay="300">

        {}
        <div className="flex items-center gap-3" data-aos="fade-up" data-aos-delay="350">
          <div className="avatar">
            <div className="w-10 rounded-full ring-2 ring-primary/50 group-hover:ring-primary transition-all duration-300">
              {
                user ? <img src={user.profile_pic_url} alt="user" /> :
                  <img src="https://api.dicebear.com/7.x/initials/svg?seed=JD" alt="user" />
              }
            </div>
          </div>
          <div>
            <p className="font-semibold text-base-content">John Doe</p>
            <p className="text-xs text-base-content/60">2 hours ago</p>
          </div>
        </div>

        {}
        <h3 className="text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent py-1" data-aos="fade-up" data-aos-delay="400">
          Stuck on Two Sum Optimization?
        </h3>
        <p className="text-base-content/80" data-aos="fade-up" data-aos-delay="450">
          My solution for Two Sum is timing out. Looking for tips or a cleaner approach than nested loops. What's the secret?
        </p>

        {}
        <div className="flex justify-between items-center pt-4 border-t border-base-300/50" data-aos="fade-up" data-aos-delay="500">
          <div className="flex items-center gap-3 text-base-content/70">
            <span className="font-bold text-sm">Solved ✓</span>
            <div className="divider divider-horizontal m-0"></div>
            <span className="text-sm">5 replies</span>
          </div>
          <Link to="/discussion" >
            <button className="btn btn-sm btn-secondary btn-outline group-hover:btn-secondary group-hover:text-white transition-all">Join Discussion</button></Link>
        </div>
      </div>
    </div>

  </div>
</section>
<section className="relative z-10 py-16 sm:py-20 lg:py-28 xl:py-32">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">


    <div className="relative" data-aos="fade-up" data-aos-delay="100">
      <div className="bg-base-200/50 border border-base-300 rounded-2xl p-6 space-y-4" data-aos="fade-up" data-aos-delay="150">
        <h4 className="font-semibold text-center text-base-content/60" data-aos="fade-up" data-aos-delay="200">TSC Analysis Report</h4>

        {}
        <div className="mockup-code text-xs" data-aos="fade-up" data-aos-delay="250">
          <pre data-prefix="1">
            <code><span className="text-purple-600">function</span> <span className="text-blue-600">findMax</span>(numbers) {'{'}</code>
          </pre>
          <pre data-prefix="2">
            <code><span className="text-purple-600">let</span> max = numbers[0];</code>
          </pre>
          <pre data-prefix="3">
            <code><span className="text-purple-600">for</span> (<span className="text-purple-600">let</span> i=1; i {'<'} numbers.length; i++) {'{'}</code>
          </pre>
          <pre data-prefix="4" className="bg-warning/20">
            <code><span className="text-purple-600">if</span> (numbers[i] {'>'} max) max = numbers[i];</code>
          </pre>
          <pre data-prefix="5"><code>{'}'}</code></pre>
          <pre data-prefix="6"><code><span className="text-purple-600">return</span> max;</code></pre>
          <pre data-prefix="7"><code>{'}'}</code></pre>
        </div>

        {}
        <div className="flex justify-around pt-4 border-t border-base-300/50" data-aos="fade-up" data-aos-delay="300">
          <div className="text-center">
            <p className="font-bold text-sm text-base-content/70">Time Complexity</p>
            <div className="badge badge-lg badge-warning mt-1">O(n) - Linear</div>
          </div>
          <div className="text-center">
            <p className="font-bold text-sm text-base-content/70">Space Complexity</p>
            <div className="badge badge-lg badge-success mt-1">O(1) - Constant</div>
          </div>
        </div>
      </div>

      {}
      <div className="absolute top-4 right-4 z-20" data-aos="fade-up" data-aos-delay="350">
        <div className="badge badge-primary badge-outline text-sm font-semibold px-4 py-2">
          Pro Feature
        </div>
      </div>
    </div>

    {}
    <div className=" text-center lg:text-left" data-aos="fade-up" data-aos-delay="200">
      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight" data-aos="fade-up" data-aos-delay="300">
        From Code to Complexity,{" "}
        <span className="bg-gradient-to-r from-warning to-error bg-clip-text text-transparent">
          Instantly
        </span>
      </h2>
      <p className="mt-4 text-lg text-base-content/70" data-aos="fade-up" data-aos-delay="400">
        Stop guessing. Our TSC Assistant analyzes your code line-by-line to give you precise time and space complexity, helping you master optimization for technical interviews.
      </p>
      <div className="mt-8" data-aos="fade-up" data-aos-delay="500">
        <Link to="/tscassistant" className="btn btn-primary btn-lg shadow-lg">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          TSC Assistant
        </Link>
      </div>
    </div>

 
  </div>
</section>
        <section className="relative z-10 py-16 sm:py-20 lg:py-28 xl:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">

            {}
            <div className="text-center mb-12 lg:mb-20" data-aos="fade-up">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
                Everything You Need to Ace the Interview
              </h2>
              <p className="mt-4 text-lg text-base-content/70 max-w-3xl mx-auto">
                Our platform is meticulously designed to provide the tools, community, and knowledge required to land your dream tech job.
              </p>
            </div>

            {}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

              {}
              <div
                className="card bg-base-200/50 shadow-lg border border-transparent hover:border-primary/50 
                           transform hover:-translate-y-2 transition-all ease-in duration-500 p-8 text-center"
                data-aos="fade-up"
                data-aos-delay="100"
              >
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Curated Problem Library</h3>
                <p className="text-base-content/70">
                  Access 2000+ problems, filtered by company, topic, and difficulty. From FAANG to startups, we've got you covered.
                </p>
              </div>

              {}
              <div
                className="card bg-base-200/50 shadow-lg border border-transparent hover:border-secondary/50 
                           transform hover:-translate-y-2 transition-all duration-300 p-8 text-center"
                data-aos="fade-up"
                data-aos-delay="200"
              >
                <div className="mx-auto w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">AI-Powered Analysis</h3>
                <p className="text-base-content/70">
                  Get instant time & space complexity reports with our TSC Assistant to understand trade-offs and write optimal code.
                </p>
              </div>

              {}
              <div
                className="card bg-base-200/50 shadow-lg border border-transparent hover:border-accent/50 
                           transform hover:-translate-y-2 transition-all duration-300 p-8 text-center"
                data-aos="fade-up"
                data-aos-delay="300"
              >
                <div className="mx-auto w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">A Thriving Community</h3>
                <p className="text-base-content/70">
                  Join thousands of motivated developers. Ask questions, share solutions, and get unstuck faster in our active discussion forums.
                </p>
              </div>

            </div>

          </div>
        </section>


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
    </>
  );
};

export default HomePage;
