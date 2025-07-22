"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowRight, Globe, Shield, TrendingUp, Zap } from "lucide-react";
import { Gavel, Star, Users } from "lucide-react";
import { Lock } from "lucide-react";
import heroImage from "~~/components/assets/hero-image.jpg";
import { Badge } from "~~/components/ui/badge";
import { Button } from "~~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~~/components/ui/card";
import { Input } from "~~/components/ui/input";

const features = [
  {
    icon: Shield,
    title: "Blockchain Security",
    description:
      "All transactions are secured by smart contracts on the Ethereum blockchain, ensuring transparency and immutability.",
  },
  {
    icon: Zap,
    title: "Instant Settlements",
    description: "Automated smart contracts handle payments and transfers instantly upon auction completion.",
  },
  {
    icon: Globe,
    title: "Global Access",
    description: "Participate in auctions from anywhere in the world with just a crypto wallet connection.",
  },
  {
    icon: Lock,
    title: "Decentralized",
    description: "No central authority controls the auctions. Everything runs on transparent blockchain protocols.",
  },
];

const stats = [
  { label: "Total Volume", value: "12,450 ETH", icon: TrendingUp },
  { label: "Active Auctions", value: "1,247", icon: Gavel },
  { label: "Registered Users", value: "45,892", icon: Users },
  { label: "Success Rate", value: "98.7%", icon: Star },
];

const Home = () => {
  const [email, setEmail] = useState("");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <section className="relative py-20 px-4 overflow-hidden bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-100/20 via-background/50 to-background" />

        <div className="container mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-left">
              <Badge className="mb-6 bg-purple-100 text-purple-800 hover:bg-purple-200 border-purple-300">
                ⚡ Powered by Blockchain Technology
              </Badge>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 text-foreground">
                Revolutionary
                <br />
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Auction
                </span>
                <br />
                Platform
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-xl">
                Experience the future of auctions with complete transparency, security, and decentralization. Every bid,
                every transaction, secured by blockchain technology.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-primary-foreground"
                >
                  Start Bidding
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-border text-foreground hover:bg-accent bg-background"
                >
                  Learn More
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-8">
                <div>
                  <div className="text-2xl font-bold text-purple-600">$2.5M+</div>
                  <div className="text-muted-foreground text-sm">Total Volume</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">10K+</div>
                  <div className="text-muted-foreground text-sm">Active Users</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">99.9%</div>
                  <div className="text-muted-foreground text-sm">Uptime</div>
                </div>
              </div>
            </div>

            <div className="relative flex justify-center items-center">
              <div className="relative w-full max-w-2xl h-auto">
                <Image
                  src={heroImage}
                  alt="Blockchain Auction Platform Illustration"
                  className="w-full h-auto object-contain rounded-lg shadow-lg"
                />
                <div className="absolute top-[10%] left-[5%] bg-background/80 backdrop-blur-sm rounded-lg px-3 py-2 border border-purple-300/30 animate-badge-float-1">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-foreground">Secure Transactions</span>
                  </div>
                </div>
                <div className="absolute bottom-[10%] right-[5%] bg-background/80 backdrop-blur-sm rounded-lg px-3 py-2 border border-yellow-300/30 animate-badge-float-2">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm text-foreground">Live Bidding</span>
                  </div>
                </div>
                <div className="absolute top-[30%] right-[0%] bg-background/80 backdrop-blur-sm rounded-lg px-3 py-2 border border-pink-300/30 animate-badge-float-3">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-pink-600" />
                    <span className="text-sm text-foreground">Instant Settlements</span>
                  </div>
                </div>
                <div className="absolute bottom-[30%] left-[0%] bg-background/80 backdrop-blur-sm rounded-lg px-3 py-2 border border-purple-300/30 animate-badge-float-4">
                  <div className="flex items-center space-x-2">
                    <Globe className="w-4 h-4 text-purple-600" />
                    <span className="text-sm text-foreground">Global Access</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-card">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  <stat.icon className="h-8 w-8 text-primary" />
                </div>
                <div className="text-3xl font-bold text-foreground mb-2">{stat.value}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-card">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-foreground">Why Choose Elaction?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Experience the next generation of auctions with unparalleled security, transparency, and global
              accessibility
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-primary/10 rounded-full">
                      <feature.icon className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <CardTitle className="text-xl text-foreground">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-background">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-foreground">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Get started with blockchain auctions in three simple steps
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-primary-foreground text-2xl font-bold">
                  1
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-foreground">Connect Your Wallet</h3>
              <p className="text-muted-foreground">
                Connect your crypto wallet (MetaMask, WalletConnect, etc.) to start participating in auctions
              </p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-primary-foreground text-2xl font-bold">
                  2
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-foreground">Browse & Bid</h3>
              <p className="text-muted-foreground">
                Explore our curated auctions and place bids on items you love. All transactions are secured by smart
                contracts
              </p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-primary-foreground text-2xl font-bold">
                  3
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-foreground">Win & Collect</h3>
              <p className="text-muted-foreground">
                Win auctions and automatically receive your items. Smart contracts handle all payments and transfers
                instantly
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold text-primary-foreground mb-4">Stay Updated</h2>
          <p className="text-purple-100 mb-8 max-w-2xl mx-auto">
            Get notified about new auctions, exclusive drops, and platform updates
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="bg-background text-foreground border-border"
            />
            <Button
              variant="secondary"
              className="whitespace-nowrap bg-secondary text-secondary-foreground hover:bg-secondary/90"
            >
              Subscribe
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
