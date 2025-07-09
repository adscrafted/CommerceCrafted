'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Image from 'next/image'
import { 
  Target,
  Users,
  Award,
  TrendingUp,
  Lightbulb
} from 'lucide-react'

export default function AboutPage() {
  const teamMembers = [
    {
      name: "Greg Davis",
      role: "Founder & CEO",
      bio: "Serial entrepreneur with 15+ years of experience building and scaling startups. Previously founded two successful SaaS companies.",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face"
    },
    {
      name: "Sarah Chen",
      role: "Head of Research",
      bio: "Former McKinsey consultant with expertise in market research and business strategy. PhD in Economics from Stanford.",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop&crop=face"
    },
    {
      name: "David Kumar",
      role: "Lead AI Engineer",
      bio: "Ex-Google AI researcher specializing in natural language processing and data analysis. Published 20+ papers in ML conferences.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face"
    }
  ]

  const values = [
    {
      icon: Target,
      title: "Data-Driven Insights",
      description: "We believe in making decisions based on solid data and thorough research, not hunches or trends."
    },
    {
      icon: Users,
      title: "Entrepreneur Success",
      description: "Our mission is to help entrepreneurs succeed by providing them with the insights they need to make informed decisions."
    },
    {
      icon: Award,
      title: "Quality Research",
      description: "Every idea in our database undergoes rigorous research and validation to ensure the highest quality insights."
    },
    {
      icon: TrendingUp,
      title: "Innovation First",
      description: "We&apos;re constantly pushing the boundaries of what&apos;s possible with AI-powered market research and business intelligence."
    }
  ]

  return (
    <div className="bg-white">

      {/* Hero Section */}
      <div className="bg-gradient-to-b from-blue-50 to-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            We&apos;re Building the Future of Business Idea Discovery
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            IdeaBrowser was founded with a simple mission: to help entrepreneurs discover and validate profitable business opportunities through comprehensive research and AI-powered insights.
          </p>
        </div>
      </div>

      {/* Story Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                After spending years building startups and watching countless entrepreneurs waste months researching ideas that were doomed from the start, our founder Greg realized there had to be a better way.
              </p>
              <p>
                Traditional business idea research was scattered, time-consuming, and often incomplete. Entrepreneurs were making critical decisions based on incomplete information, leading to failure rates that could have been avoided.
              </p>
              <p>
                That&apos;s when we decided to build IdeaBrowser – a comprehensive platform that combines human expertise with AI-powered research to provide entrepreneurs with the insights they need to succeed.
              </p>
            </div>
          </div>
          <div className="lg:pl-8">
            <Image 
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=400&fit=crop" 
              alt="Team collaboration"
              width={600}
              height={400}
              className="rounded-lg shadow-lg"
            />
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              The principles that guide everything we do at IdeaBrowser.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="border-0 shadow-md">
                <CardContent className="p-8">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-4">
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
                        <value.icon className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">
                        {value.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {value.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            The passionate individuals behind IdeaBrowser who are dedicated to helping entrepreneurs succeed.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {teamMembers.map((member, index) => (
            <Card key={index} className="text-center border-0 shadow-md">
              <CardContent className="p-8">
                <Image 
                  src={member.image}
                  alt={member.name}
                  width={96}
                  height={96}
                  className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {member.name}
                </h3>
                <p className="text-blue-600 font-medium mb-4">
                  {member.role}
                </p>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {member.bio}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Mission Section */}
      <div className="bg-blue-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-6">
            <Lightbulb className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Our Mission
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed mb-8">
            To democratize access to high-quality business research and empower every entrepreneur with the insights they need to build successful, profitable businesses.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">1000+</div>
              <div className="text-gray-600">Ideas Researched</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">50+</div>
              <div className="text-gray-600">Industries Covered</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">10K+</div>
              <div className="text-gray-600">Entrepreneurs Helped</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Ready to Join the Future of Business Discovery?
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Join thousands of entrepreneurs who trust IdeaBrowser to help them discover and validate their next big opportunity.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
            Start Free Trial
          </Button>
          <Button size="lg" variant="outline">
            Contact Us
          </Button>
        </div>
      </div>
    </div>
  )
}