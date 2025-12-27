import { useState, useEffect } from "react";
import { Eye, EyeOff, ArrowRight, Sparkles, AlertTriangle, Ghost } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface AuthPageProps {
  onLogin: (user: any) => void;
  onGuest: () => void;
}

export function AuthPage({ onLogin, onGuest }: AuthPageProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Form States
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    dob: "",
    password: ""
  });
  
  const [error, setError] = useState("");
  
  // --- NEW PUN LOGIC ---
  const [currentPun, setCurrentPun] = useState(""); 
  const [fieldPuns, setFieldPuns] = useState<Record<string, string>>({});

  // 1. Generate Puns ONCE on mount (Refresh to change)
  useEffect(() => {
    const punLibrary = {
      username: ["Captain Cool?", "TheOneWhoKnocks?", "IdentityTheftIsntAJoke", "FutureCEO", "MainCharacterVibes"],
      password: ["Relax, we aren't seeing it", "Secret sauce 🤫", "shhh... it's safe", "1234... just kidding", "Top secret clearance"],
      email: ["We won't spam (much)", "College ID preferred", "Slide into our database", "No owls, just emails"],
      dob: ["Age is just a number", "Level 1 started on...", "Technically an adult?", "Vintage year?"],
      name: ["What do friends call you?", "The legend themself", "Name on the degree"],
      default: "Ready to save the semester?"
    };

    const getRandom = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

    setFieldPuns({
      username: getRandom(punLibrary.username),
      password: getRandom(punLibrary.password),
      email: getRandom(punLibrary.email),
      dob: getRandom(punLibrary.dob),
      name: getRandom(punLibrary.name),
      default: punLibrary.default
    });
    
    // Set initial pun
    setCurrentPun(punLibrary.default);
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError("");
  };

  // Switch pun only when field is focused
  const handleFocus = (field: string) => {
    if (fieldPuns[field]) {
      setCurrentPun(fieldPuns[field]);
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Check for empty fields (Added dob check)
    if (!formData.name || !formData.username || !formData.email || !formData.password || !formData.dob) {
      setError("Please fill in all fields!");
      return;
    }

    // 2. AGE VALIDATION LOGIC
    const birthDate = new Date(formData.dob);
    const today = new Date();
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    // Adjust age if birthday hasn't occurred yet this year
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age < 16) {
      setError("You must be at least 16 years old to join CampusJugaad.");
      return;
    }

    // 3. User Existence Check
    const existingUsers = JSON.parse(localStorage.getItem("campus_jugaad_users") || "[]");
    
    if (existingUsers.find((u: any) => u.email === formData.email)) {
      setError("Email already exists! Try logging in.");
      return;
    }

    // 4. Create User
    const newUser = { ...formData, id: Date.now().toString() };
    existingUsers.push(newUser);
    localStorage.setItem("campus_jugaad_users", JSON.stringify(existingUsers));
    
    onLogin(newUser);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const existingUsers = JSON.parse(localStorage.getItem("campus_jugaad_users") || "[]");
    const user = existingUsers.find((u: any) => u.email === formData.email && u.password === formData.password);

    if (user) {
      onLogin(user);
    } else {
      setError("Invalid credentials. Maybe register first?");
    }
  };

  return (
    <div className="min-h-screen bg-[var(--campus-bg)] flex flex-col items-center justify-center p-4 relative overflow-hidden transition-colors duration-300">
      {/* Background Blobs */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#2D7FF9]/20 rounded-full blur-[120px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#9D4EDD]/20 rounded-full blur-[120px] animate-pulse pointer-events-none" style={{ animationDelay: '1s' }} />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#2D7FF9] to-[#9D4EDD] bg-clip-text text-transparent mb-2">
            CampusJugaad
          </h1>
          <p className="text-[var(--campus-text-secondary)]">Delegate chaos. Be a Hero.</p>
        </div>

        <div className="bg-[var(--campus-card-bg)] backdrop-blur-xl border border-[var(--campus-border)] p-6 md:p-8 rounded-3xl shadow-2xl transition-all duration-500">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-[var(--campus-text-primary)]">
              {isRegistering ? "Join the Squad" : "Welcome Back"}
            </h2>
            <Sparkles className="w-6 h-6 text-[#F72585] animate-spin-slow" />
          </div>

          <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-4">
            
            {/* Stable Pun Cloud */}
            <div className="h-6 text-center text-sm font-medium text-[#2D7FF9] transition-all duration-300">
              {currentPun || "Ready?"}
            </div>

            {isRegistering && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[var(--campus-text-secondary)]">Full Name</Label>
                  <Input 
                    placeholder="Real Name" 
                    className="bg-[var(--campus-bg)] border-[var(--campus-border)] text-[var(--campus-text-primary)]"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    onFocus={() => handleFocus("name")}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[var(--campus-text-secondary)]">Username</Label>
                  <Input 
                    placeholder="CoolName123" 
                    className="bg-[var(--campus-bg)] border-[var(--campus-border)] text-[var(--campus-text-primary)]"
                    value={formData.username}
                    onChange={(e) => handleInputChange("username", e.target.value)}
                    onFocus={() => handleFocus("username")}
                  />
                </div>
              </div>
            )}

            {isRegistering && (
               <div className="space-y-2">
                  <Label className="text-[var(--campus-text-secondary)]">Date of Birth</Label>
                  <Input 
                    type="date"
                    className="bg-[var(--campus-bg)] border-[var(--campus-border)] text-[var(--campus-text-primary)]"
                    value={formData.dob}
                    onChange={(e) => handleInputChange("dob", e.target.value)}
                    onFocus={() => handleFocus("dob")}
                  />
               </div>
            )}

            <div className="space-y-2">
              <Label className="text-[var(--campus-text-secondary)]">Email Address</Label>
              <Input 
                type="email" 
                placeholder="student@college.edu" 
                className="bg-[var(--campus-bg)] border-[var(--campus-border)] text-[var(--campus-text-primary)]"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                onFocus={() => handleFocus("email")}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[var(--campus-text-secondary)]">Password</Label>
              <div className="relative">
                <Input 
                  type="password"
                  placeholder="••••••••" 
                  className="bg-[var(--campus-bg)] border-[var(--campus-border)] pr-10 text-[var(--campus-text-primary)]"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  onFocus={() => handleFocus("password")}
                />
                {/* Note: I removed the toggle button here to keep the code simpler for copy-paste, 
                    but you can add the eye icon toggle back if you prefer. 
                    The type="password" handles the masking. */}
              </div>
            </div>

            {error && <p className="text-red-500 text-sm text-center font-medium animate-pulse">{error}</p>}

            <Button className="w-full bg-gradient-to-r from-[#2D7FF9] to-[#9D4EDD] hover:opacity-90 transition-opacity h-12 text-lg font-bold shadow-lg text-white">
              {isRegistering ? "Register Account" : "Login"} <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </form>

          <div className="mt-6 flex flex-col gap-4 text-center">
            <p className="text-[var(--campus-text-secondary)] text-sm">
              {isRegistering ? "Already have an account?" : "New to Campus?"} {" "}
              <button 
                onClick={() => { setIsRegistering(!isRegistering); setError(""); setCurrentPun(fieldPuns.default); }}
                className="text-[#2D7FF9] hover:underline font-bold"
              >
                {isRegistering ? "Login Here" : "Create Account"}
              </button>
            </p>

            <div className="relative">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-[var(--campus-border)]"></span></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-[var(--campus-card-bg)] px-2 text-[var(--campus-text-secondary)]">For Judges</span></div>
            </div>

            <button 
              onClick={onGuest}
              className="text-sm text-[var(--campus-text-secondary)] hover:text-[var(--campus-text-primary)] flex items-center justify-center gap-2 transition-colors"
            >
              <Ghost className="w-4 h-4" /> Continue as Guest (Prototype)
            </button>
          </div>
        </div>

        {/* Prototype Warning */}
        <div className="mt-8 bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-xl flex items-start gap-3 backdrop-blur-sm">
           <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
           <p className="text-xs text-yellow-200/80 leading-relaxed text-left">
             <span className="font-bold text-yellow-500">Prototype Notice:</span> No OTP will be sent. 
             <br></br>Clearing browser cache deletes accounts.
           </p>
        </div>
      </div>
    </div>
  );
}