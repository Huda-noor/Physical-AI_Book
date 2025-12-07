---
id: chapter-2-basics-of-humanoid-robotics
title: Chapter 2 - The Robotic Nervous System (ROS 2)
sidebar_label: 2. ROS 2 Fundamentals
sidebar_position: 2
---

# Chapter 2: The Robotic Nervous System (ROS 2)

## Module 1: Middleware for Robot Control

## Weeks 3-5: ROS 2 Fundamentals

### Learning Objectives

By the end of this chapter, you will be able to:

- Understand ROS 2 architecture and core concepts
- Create and manage nodes, topics, services, and actions
- Build ROS 2 packages with Python using `rclpy`
- Bridge Python AI agents to ROS controllers
- Work with URDF (Unified Robot Description Format) for humanoid robots
- Configure launch files and manage parameters

## 2.1 What is ROS 2?

**ROS 2 (Robot Operating System 2)** is the industry-standard middleware for robotics development. Think of it as the "nervous system" that connects sensors, actuators, and AI algorithms in a distributed robot architecture.

### Why ROS 2?

Unlike ROS 1, ROS 2 is designed for:
- **Real-time performance**: Deterministic communication for safety-critical systems
- **Multi-robot systems**: Native support for swarms and collaborative robots
- **Security**: Built-in encryption and authentication
- **Cross-platform**: Linux, Windows, macOS support
- **Industrial deployment**: Used by companies like Boston Dynamics, NASA, and Tesla

### ROS 2 Distributions

- **Humble Hawksbill** (LTS): Ubuntu 22.04, recommended for this course
- **Iron Irwini**: Latest stable release
- **Rolling Ridley**: Bleeding-edge development

## Core Concepts

### Mechanical Fundamentals

#### Degrees of Freedom (DOF)

A **degree of freedom** is an independent direction of motion. Human-like robots typically have:

- **Arms**: 7 DOF per arm (shoulder: 3, elbow: 1, wrist: 3)
- **Legs**: 6 DOF per leg (hip: 3, knee: 1, ankle: 2)
- **Torso**: 3 DOF (pitch, roll, yaw)
- **Head**: 2-3 DOF (pan, tilt, optional roll)

**Total**: 25-30 DOF for a full humanoid

#### Kinematic Chains

- **Serial chain**: Joints connected in sequence (like an arm)
- **Parallel chain**: Multiple actuators control a single joint (increased strength)
- **Closed-loop chain**: Forms a loop (used in legs for stability)

### Actuator Technologies

#### 1. Electric Motors

**Advantages:**
- Precise position control
- High repeatability
- Easy to integrate with digital controllers

**Types:**
- **DC brushless motors**: High efficiency, long lifespan
- **Servo motors**: Built-in position feedback
- **Stepper motors**: Precise incremental motion

#### 2. Hydraulic Actuators

**Advantages:**
- High power-to-weight ratio
- Suitable for heavy-duty applications

**Disadvantages:**
- Requires hydraulic pump and fluid management
- Maintenance-intensive
- Risk of leaks

#### 3. Pneumatic Actuators

**Advantages:**
- Compliant (safe for human interaction)
- Lightweight

**Disadvantages:**
- Lower precision than electric motors
- Requires compressed air source

### Sensors for Perception and Control

#### Vision Sensors

- **RGB cameras**: Color imaging for object recognition
- **Depth cameras** (e.g., RealSense): 3D environment mapping
- **Stereo cameras**: Depth perception through parallax

#### Proprioceptive Sensors

- **Encoders**: Measure joint angles (position feedback)
- **IMU (Inertial Measurement Unit)**: Detects orientation and acceleration
- **Force/Torque sensors**: Measure interaction forces at joints

#### Tactile Sensors

- **Pressure sensors**: Detect contact and grip force
- **Skin sensors**: Distributed touch sensing on robot surface

### Kinematics and Dynamics

#### Forward Kinematics

Given joint angles, calculate the end-effector position:

```
Position = f(θ₁, θ₂, ..., θₙ)
```

**Example**: With 3 joint angles (shoulder, elbow, wrist), determine where the hand is in 3D space.

#### Inverse Kinematics

Given desired end-effector position, calculate required joint angles:

```
(θ₁, θ₂, ..., θₙ) = f⁻¹(desired position)
```

**Challenge**: Often has multiple solutions or no solution (workspace limits).

#### Dynamics

Dynamics govern how forces and torques affect motion. The **equation of motion**:

```
τ = M(q)q̈ + C(q,q̇)q̇ + G(q)
```

Where:
- **τ**: Joint torques (control input)
- **M(q)**: Inertia matrix
- **C(q,q̇)**: Coriolis and centrifugal forces
- **G(q)**: Gravity forces

## Practical Application

### Walking Control

Humanoid walking requires:

1. **Gait planning**: Define foot trajectories and center of mass motion
2. **Balance control**: Keep center of pressure within support polygon
3. **Compliance**: Absorb impacts and adapt to uneven terrain

**Zero Moment Point (ZMP)** is a key stability criterion: the point where the net moment from gravity and inertia is zero.

### Example: Simple Balance Controller

```python
# Pseudocode for balance control
def balance_controller(imu_data, target_orientation):
    error = target_orientation - imu_data.orientation
    torque_correction = PID_control(error)
    apply_torque_to_ankle_joints(torque_correction)
```

This simple controller adjusts ankle torques to maintain upright posture.

## Summary

Humanoid robots combine mechanical design, actuation, sensing, and control to achieve human-like motion. The field draws on mechanical engineering, control theory, and AI to create machines that can navigate and interact with human environments.

**Key Takeaways:**
- Humanoids have 25-30 degrees of freedom to mimic human motion
- Actuator choice (electric, hydraulic, pneumatic) involves trade-offs in power, precision, and safety
- Sensors provide feedback for perception (vision) and control (encoders, IMUs)
- Kinematics and dynamics are essential for planning and executing motion

## Further Reading

- **Books**:
  - *Humanoid Robotics: A Reference* by Ambarish Goswami and Prahlad Vadakkepat
  - *Introduction to Robotics: Mechanics and Control* by John J. Craig

- **Research Papers**:
  - "Bipedal Walking Control Based on Capture Point Dynamics" (IROS 2011)
  - "Atlas: A Hydraulic Humanoid Robot" by Boston Dynamics

- **Online Resources**:
  - [NASA Valkyrie Robot](https://www.nasa.gov/feature/valkyrie)
  - [Unitree Robotics H1](https://www.unitree.com/h1)
  - [Open Dynamics Engine (ODE) Tutorial](https://www.ode.org/)
