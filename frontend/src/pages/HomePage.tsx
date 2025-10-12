import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

import NavBar from '@/components/navbar'
import Footer from '@/components/footer'

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />

      <main className="flex-grow container mx-auto px-4 py-20">
        <section className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">EAD Automobile Service Management</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Manage appointments, customers and employees with an easy-to-use platform tailored for garages and service centers.
          </p>

          <div className="flex justify-center gap-4">
            <Link to="/register">
              <Button size="lg">Get Started</Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg">Login</Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default HomePage
