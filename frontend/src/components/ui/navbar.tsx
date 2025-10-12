import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from './button'

const NavBar: React.FC = () => {
  return (
    <header className="w-full bg-background shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold">EAD Auto</Link>

        <nav className="flex items-center gap-3">
          <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground">
            Login
          </Link>
          <Link to="/register">
            <Button size="sm">Register</Button>
          </Link>
        </nav>
      </div>
    </header>
  )
}

export default NavBar
