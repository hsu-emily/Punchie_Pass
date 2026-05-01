import React from 'react';
import Layout from "@/ui/Layout";
import NavBar from "@/ui/NavBar";
import { BookOpen, Zap, Users, Sparkles } from 'lucide-react';

const About = () => {
    return (
        <Layout>
           <NavBar></NavBar>
            <div className="page-content">
                <h1 className="page-heading">
                    About Punchie Pass
                </h1>
                
                <p className="page-text" style={{ marginBottom: '2rem' }}>
                    We believe building better habits shouldn't feel like a chore. 
                    That's why we created <span style={{ fontWeight: 'bold', color: '#EC4899' }}>Punchie Pass</span> — 
                    a habit tracker that turns self-improvement into something you actually look forward to.
                </p>

                {/* The Story */}
                <div style={{ 
                    maxWidth: '42rem', 
                    margin: '3rem auto 3rem',
                    background: 'linear-gradient(to bottom right, #faf5ff, #fff)',
                    padding: '2.5rem',
                    borderRadius: '1.5rem',
                    border: '2px solid #E9D5FF'
                }}>
                    <h2 style={{ 
                        fontSize: '1.75rem', 
                        fontWeight: 'bold', 
                        color: '#7C3AED',
                        marginBottom: '1.5rem',
                        textAlign: 'center'
                    }}>
                        Why Punch Cards?
                    </h2>
                    <p style={{ color: '#4B5563', lineHeight: '1.75', marginBottom: '1rem' }}>
                        Remember the satisfaction of getting that 10th stamp at your local café? 
                        Or the joy of filling up a sticker chart as a kid? That's the magic we wanted to capture.
                    </p>
                    <p style={{ color: '#4B5563', lineHeight: '1.75', margin: 0 }}>
                        Punchie Pass combines nostalgic punch cards with modern habit science and AI coaching 
                        to help you build sustainable routines — one punch at a time.
                    </p>
                </div>

                {/* How It Works */}
                <h2 style={{ 
                    fontSize: '2rem', 
                    fontWeight: 'bold', 
                    color: '#DB2777',
                    marginBottom: '2rem',
                    textAlign: 'center'
                }}>
                    How It Works
                </h2>

                <div style={{ 
                    maxWidth: '48rem', 
                    margin: '2rem auto', 
                    display: 'grid', 
                    gridTemplateColumns: '1fr',
                    gap: '1.5rem'
                }}>
                    {/* Step 1 */}
                    <div style={{ 
                        display: 'flex', 
                        gap: '1.5rem',
                        padding: '1.5rem',
                        background: 'rgba(255, 255, 255, 0.5)',
                        borderRadius: '1rem',
                        border: '1px solid #FBCFE8'
                    }}>
                        <div style={{ 
                            width: '3rem', 
                            height: '3rem', 
                            borderRadius: '50%',
                            background: 'linear-gradient(to bottom right, #EC4899, #DB2777)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.5rem',
                            fontWeight: 'bold',
                            flexShrink: 0
                        }}>
                            1
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#DB2777', marginBottom: '0.5rem' }}>
                                Create Your Habit
                            </h3>
                            <p style={{ color: '#4B5563', lineHeight: '1.6', margin: 0 }}>
                                Tell us what you want to achieve. Want to drink more water? Exercise daily? 
                                Read before bed? We'll help you turn it into a trackable habit with a beautiful punch card.
                            </p>
                        </div>
                    </div>

                    {/* Step 2 */}
                    <div style={{ 
                        display: 'flex', 
                        gap: '1.5rem',
                        padding: '1.5rem',
                        background: 'rgba(255, 255, 255, 0.5)',
                        borderRadius: '1rem',
                        border: '1px solid #E9D5FF'
                    }}>
                        <div style={{ 
                            width: '3rem', 
                            height: '3rem', 
                            borderRadius: '50%',
                            background: 'linear-gradient(to bottom right, #9333EA, #7C3AED)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.5rem',
                            fontWeight: 'bold',
                            flexShrink: 0
                        }}>
                            2
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#7C3AED', marginBottom: '0.5rem' }}>
                                Punch Daily
                            </h3>
                            <p style={{ color: '#4B5563', lineHeight: '1.6', margin: 0 }}>
                                Complete your habit? Punch your card! Watch it fill up with satisfying visual progress. 
                                Each punch brings you closer to your reward — and closer to making this habit stick.
                            </p>
                        </div>
                    </div>

                    {/* Step 3 */}
                    <div style={{ 
                        display: 'flex', 
                        gap: '1.5rem',
                        padding: '1.5rem',
                        background: 'rgba(255, 255, 255, 0.5)',
                        borderRadius: '1rem',
                        border: '1px solid #A7F3D0'
                    }}>
                        <div style={{ 
                            width: '3rem', 
                            height: '3rem', 
                            borderRadius: '50%',
                            background: 'linear-gradient(to bottom right, #10B981, #059669)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.5rem',
                            fontWeight: 'bold',
                            flexShrink: 0
                        }}>
                            3
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#10B981', marginBottom: '0.5rem' }}>
                                Unlock Your Reward
                            </h3>
                            <p style={{ color: '#4B5563', lineHeight: '1.6', margin: 0 }}>
                                Complete your punch card and treat yourself! Whether it's a favorite snack, 
                                a shopping spree, or a guilt-free Netflix binge — you earned it. 
                                Then start fresh with a new card!
                            </p>
                        </div>
                    </div>
                </div>

                {/* What Makes Us Different */}
                <div style={{ 
                    maxWidth: '42rem', 
                    margin: '4rem auto 2rem',
                    background: 'linear-gradient(to bottom right, #fce7f3, #fff)',
                    padding: '2.5rem',
                    borderRadius: '1.5rem',
                    border: '2px solid #FBCFE8'
                }}>
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <Sparkles size={40} style={{ color: '#EC4899', marginBottom: '1rem' }} />
                        <h2 style={{ 
                            fontSize: '1.75rem', 
                            fontWeight: 'bold', 
                            color: '#DB2777',
                            marginBottom: '1rem'
                        }}>
                            What Makes Us Special
                        </h2>
                    </div>
                    
                    <ul style={{ 
                        listStyle: 'none', 
                        padding: 0, 
                        margin: 0,
                        color: '#4B5563',
                        lineHeight: '2'
                    }}>
                        <li style={{ marginBottom: '1rem' }}>
                            ✨ <strong>Beautiful Design</strong> — Punch cards that actually look good
                        </li>
                        <li style={{ marginBottom: '1rem' }}>
                            🤖 <strong>AI Coach</strong> — Weekly reflections with personalized feedback
                        </li>
                        <li style={{ marginBottom: '1rem' }}>
                            📔 <strong>Private Journals</strong> — Keep all your reflections in one place
                        </li>
                        <li style={{ marginBottom: '1rem' }}>
                            🎁 <strong>Real Rewards</strong> — Not badges or points — actual treats you choose
                        </li>
                        <li style={{ marginBottom: '1rem' }}>
                            📱 <strong>Simple & Fun</strong> — No overwhelming features, just what you need
                        </li>
                    </ul>
                </div>

                {/* Call to Action */}
                <div style={{ marginTop: '3rem', textAlign: 'center' }}>
                    <p style={{ 
                        fontSize: '1.25rem', 
                        color: '#4B5563',
                        marginBottom: '2rem',
                        fontWeight: '500'
                    }}>
                        Ready to make habits stick?
                    </p>
                    <a 
                        href="/signup"
                        style={{
                            display: 'inline-block',
                            padding: '1rem 2.5rem',
                            background: 'linear-gradient(to right, #9333EA, #EC4899)',
                            color: 'white',
                            borderRadius: '9999px',
                            fontWeight: '600',
                            fontSize: '1.125rem',
                            textDecoration: 'none',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                            transition: 'transform 0.2s, box-shadow 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                        }}
                    >
                        Get Started Free ✨
                    </a>
                </div>
            </div>
        </Layout>
    );
};

export default About;