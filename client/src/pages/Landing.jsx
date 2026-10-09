import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Menu,
  X,
  Receipt,
  CreditCard,
  BarChart3,
  Target,
  ArrowRight,
  Smartphone,
  Tablet,
  Monitor,
  Share,
  MoreVertical,
  PlusSquare,
  Download,
  ExternalLink,
} from "lucide-react";

const Landing = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    {
      icon: Receipt,
      title: "Expense Tracking",
      description: "Easily record and organize your daily expenses.",
    },
    {
      icon: CreditCard,
      title: "Multiple Accounts",
      description: "Manage bank accounts, cash, wallets and credit cards.",
    },
    {
      icon: BarChart3,
      title: "Smart Reports",
      description: "Understand your spending through useful reports.",
    },
    {
      icon: Target,
      title: "Budgets",
      description: "Set spending limits and keep your finances on track.",
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Create Account",
      description: "Create your personal ExpenseTracker account.",
    },
    {
      number: "02",
      title: "Add Accounts",
      description: "Add your bank, cash, wallet or credit card.",
    },
    {
      number: "03",
      title: "Track Expenses",
      description: "Record your income and daily expenses.",
    },
    {
      number: "04",
      title: "Analyze",
      description: "Use reports and budgets to understand your money.",
    },
  ];

  const closeMenu = () => {
    setMobileMenuOpen(false);
  };

  const installGuides = [
    {
      title: "Android phone & tablet",
      subtitle: "Google Chrome",
      icon: Smartphone,
      iconColor: "bg-green-100 text-green-700",
      steps: [
        "Open Chrome and visit myexpensestracker.in.",
        "Tap the three-dot menu in the top-right corner.",
        "Choose “Install app” or “Install and create shortcut”. If neither appears, look for “Add to Home screen”.",
        "Follow the on-screen instructions to finish.",
      ],
    },
    {
      title: "iPhone & iPad",
      subtitle: "Safari",
      icon: Tablet,
      iconColor: "bg-blue-100 text-blue-700",
      steps: [
        "Open Safari and visit myexpensestracker.in.",
        "Tap the Share button.",
        "Choose “Add to Home Screen”. You may need to scroll through the options.",
        "Tap “Add” to place the icon on your Home Screen.",
      ],
    },
    {
      title: "Windows PC",
      subtitle: "Microsoft Edge",
      icon: Monitor,
      iconColor: "bg-violet-100 text-violet-700",
      steps: [
        "Open Microsoft Edge and visit myexpensestracker.in.",
        "Open the three-dot menu in the top-right corner.",
        "Choose Settings and more → More tools → Apps.",
        "Select “Install this site as an app” and follow the prompts.",
      ],
    },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-white">
      {/* NAVBAR */}
      <header className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:h-[68px] sm:px-6 lg:h-[72px] lg:px-8">
          <Link
            to="/"
            onClick={closeMenu}
            className="shrink-0 text-lg font-bold tracking-tight text-violet-600 sm:text-xl"
          >
            ExpenseTracker
          </Link>

          <nav className="hidden items-center gap-5 md:flex lg:gap-7">
            <a
              href="#features"
              className="text-sm font-medium text-gray-600 transition hover:text-violet-600"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-sm font-medium text-gray-600 transition hover:text-violet-600"
            >
              How It Works
            </a>
            <a
              href="#install-app"
              className="text-sm font-medium text-gray-600 transition hover:text-violet-600"
            >
              Install App
            </a>
            <a
              href="#about"
              className="text-sm font-medium text-gray-600 transition hover:text-violet-600"
            >
              About
            </a>
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <Link
              to="/login"
              className="rounded-lg px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700"
            >
              Get Started
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100 md:hidden"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-gray-100 md:hidden">
            <div className="px-4 py-4 sm:px-6">
              <nav className="flex flex-col">
                <a
                  href="#features"
                  onClick={closeMenu}
                  className="rounded-lg px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Features
                </a>
                <a
                  href="#how-it-works"
                  onClick={closeMenu}
                  className="rounded-lg px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  How It Works
                </a>
                <a
                  href="#install-app"
                  onClick={closeMenu}
                  className="rounded-lg px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Install App
                </a>
                <a
                  href="#about"
                  onClick={closeMenu}
                  className="rounded-lg px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  About
                </a>
              </nav>

              <div className="mt-3 grid grid-cols-2 gap-2 border-t border-gray-100 pt-3">
                <Link
                  to="/login"
                  onClick={closeMenu}
                  className="flex h-11 items-center justify-center rounded-lg border border-gray-200 text-sm font-semibold text-gray-700"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={closeMenu}
                  className="flex h-11 items-center justify-center rounded-lg bg-violet-600 text-sm font-semibold text-white"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      <main>
        {/* HERO */}
        <section className="px-4 pb-5 pt-5 sm:px-6 sm:pb-20 sm:pt-20 md:px-8 md:pb-20 md:pt-20 lg:pb-20 lg:pt-20">
          <div className="mx-auto w-full max-w-7xl">
            <div className="mx-auto max-w-4xl text-center">
              <p className="mb-5 text-xs font-semibold uppercase tracking-wider text-violet-600 sm:mb-6 sm:text-sm">
                Smart Personal Finance
              </p>
              <h1 className="text-4xl font-bold leading-[1.12] tracking-tight text-gray-900 sm:text-5xl md:text-6xl lg:text-[60px] xl:text-[64px]">
                Take Control of{" "}
                <span className="text-violet-600">Your Money</span>
              </h1>
              <p className="mx-auto mt-5 max-w-2xl text-sm leading-6 text-gray-600 sm:mt-6 sm:text-base sm:leading-7 md:text-lg md:leading-8">
                Track your expenses, manage your accounts, set budgets, and
                understand your financial habits — all in one place.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:justify-center">
                <Link
                  to="/register"
                  className="group flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-violet-600 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 sm:w-auto"
                >
                  Start Tracking
                  <ArrowRight
                    size={17}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>
                <Link
                  to="/login"
                  className="flex h-12 w-full items-center justify-center rounded-lg border border-gray-200 bg-white px-6 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 sm:w-auto"
                >
                  Login
                </Link>
              </div>
              <a
                href="#install-app"
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-violet-700 hover:text-violet-800"
              >
                <Download size={17} />
                Install on your device
              </a>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section
          id="features"
          className="bg-gray-50 px-4 py-16 sm:px-6 sm:py-20 md:px-8 md:py-24 lg:py-28"
        >
          <div className="mx-auto w-full max-w-7xl">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl md:text-4xl">
                Everything You Need
              </h2>
              <p className="mt-3 text-sm text-gray-600 sm:text-base">
                Simple tools to help you manage your finances.
              </p>
            </div>
            <div className="mx-auto mt-10 grid max-w-5xl grid-cols-2 gap-3 sm:mt-12 sm:gap-5 lg:grid-cols-4 lg:gap-4">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-6"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-100 text-violet-600 sm:h-10 sm:w-10">
                      <Icon size={18} />
                    </div>
                    <h3 className="mt-4 text-sm font-bold leading-5 text-gray-900 sm:mt-5 sm:text-lg">
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-xs leading-5 text-gray-600 sm:text-sm sm:leading-6">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section
          id="how-it-works"
          className="px-4 py-16 sm:px-6 sm:py-20 md:px-8 md:py-24 lg:py-28"
        >
          <div className="mx-auto w-full max-w-7xl">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl md:text-4xl">
                How It Works
              </h2>
              <p className="mt-3 text-sm text-gray-600 sm:text-base">
                Start managing your money in just a few steps.
              </p>
            </div>
            <div className="mx-auto mt-10 grid max-w-5xl grid-cols-1 gap-10 sm:mt-12 sm:grid-cols-2 sm:gap-y-12 lg:grid-cols-4 lg:gap-6">
              {steps.map((step) => (
                <div
                  key={step.number}
                  className="mx-auto w-full max-w-xs text-center"
                >
                  <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-600 sm:h-12 sm:w-12 sm:text-sm">
                    {step.number}
                  </div>
                  <h3 className="mt-4 text-sm font-bold text-gray-900 sm:text-base">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-xs leading-5 text-gray-600 sm:text-sm sm:leading-6">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* INSTALL APP - RESPONSIVE ON MOBILE, TABLET AND DESKTOP */}
        <section
          id="install-app"
          className="scroll-mt-20 bg-gradient-to-br from-violet-50 via-white to-indigo-50 px-4 py-16 sm:px-6 sm:py-20 md:px-8 md:py-24"
        >
          <div className="mx-auto w-full max-w-7xl">
            <div className="mx-auto max-w-3xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full bg-violet-100 px-4 py-2 text-xs font-semibold text-violet-700 sm:text-sm">
                <Download size={16} />
                Quick access on your devices
              </span>
              <h2 className="mt-5 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl md:text-4xl">
                Install Expense Tracker
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-gray-600 sm:text-base sm:leading-7">
                Add Expense Tracker to your phone, tablet or computer for quick
                access from your Home Screen, desktop or app launcher.
              </p>
            </div>

            <div className="mx-auto mt-10 grid max-w-6xl grid-cols-1 gap-5 sm:mt-12 md:grid-cols-2 xl:grid-cols-3 xl:gap-6">
              {installGuides.map((guide) => {
                const Icon = guide.icon;
                return (
                  <article
                    key={guide.title}
                    className="flex h-full min-w-0 flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-6 lg:p-7"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${guide.iconColor}`}
                      >
                        <Icon size={23} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-base font-bold text-gray-900 sm:text-lg">
                          {guide.title}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {guide.subtitle}
                        </p>
                      </div>
                    </div>

                    <ol className="mt-6 flex-1 space-y-4">
                      {guide.steps.map((step, index) => (
                        <li
                          key={step}
                          className="flex items-start gap-3 text-sm leading-6 text-gray-600"
                        >
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-700">
                            {index + 1}
                          </span>
                          <span className="min-w-0 break-words">{step}</span>
                        </li>
                      ))}
                    </ol>

                    <a
                      href="https://myexpensestracker.in"
                      target="_blank"
                      rel="noreferrer"
                      className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-violet-200 px-4 py-2.5 text-sm font-semibold text-violet-700 transition hover:bg-violet-50 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
                    >
                      Open Expense Tracker
                      <ExternalLink size={16} />
                    </a>
                  </article>
                );
              })}
            </div>

            <div className="mx-auto mt-6 max-w-4xl rounded-xl border border-violet-100 bg-white/80 p-4 sm:mt-8 sm:p-5">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 shrink-0 text-violet-600">
                  <Share size={19} />
                </div>
                <p className="text-xs leading-5 text-gray-600 sm:text-sm sm:leading-6">
                  <strong className="text-gray-800">Tip:</strong> The menu
                  wording can differ by browser and device. If you do not see an
                  install option, look for “Add to Home Screen” or “Create
                  shortcut”. On iPhone and iPad, use Safari’s Share menu.
                  Installing or adding a shortcut does not create an account;
                  sign in with your existing Expense Tracker account.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section
          id="about"
          className="bg-violet-600 px-4 py-16 sm:px-6 sm:py-20 md:px-8 md:py-24"
        >
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-2xl font-bold text-white sm:text-3xl md:text-4xl">
              Ready to Take Control?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-violet-100 sm:text-base sm:leading-7">
              Start tracking your expenses and understand your finances better.
            </p>
            <Link
              to="/register"
              className="mt-7 inline-flex h-11 items-center justify-center rounded-lg bg-white px-6 text-sm font-semibold text-violet-600 transition hover:bg-gray-50 sm:mt-8 sm:h-12"
            >
              Get Started
            </Link>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-gray-100 bg-white">
        <div className="mx-auto flex min-h-[68px] w-full max-w-7xl items-center justify-center px-4 sm:min-h-[72px] sm:px-6 lg:px-8">
          <p className="text-center text-xs text-gray-500 sm:text-sm">
            © 2026 ExpenseTracker. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
