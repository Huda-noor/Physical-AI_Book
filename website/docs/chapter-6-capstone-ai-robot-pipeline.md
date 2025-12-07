---
id: chapter-6-capstone-ai-robot-pipeline
title: "Chapter 6 - Capstone: Simple AI-Robot Pipeline"
sidebar_label: 6. Capstone Project
sidebar_position: 6
---

# Chapter 6: Capstone - Simple AI-Robot Pipeline

## Learning Objectives

By the end of this chapter, you will be able to:

- Design an end-to-end AI-robot pipeline from perception to action
- Integrate ROS 2, simulation, and AI models in a cohesive system
- Apply best practices for robot software architecture
- Deploy and test a complete robotic application

## Introduction

This capstone chapter brings together concepts from all previous chapters to build a complete **AI-robot pipeline**. You'll create a system that:

1. Perceives the environment with sensors
2. Processes data with AI models
3. Plans and executes actions
4. Operates safely in simulation and on real hardware

This hands-on project demonstrates the full software stack for Physical AI systems.

## Core Concepts

### System Architecture

A typical AI-robot pipeline consists of four layers:

```
┌──────────────────────────────────────────┐
│  Perception Layer (Sensors → AI Models) │
├──────────────────────────────────────────┤
│  Cognition Layer (Decision Making)      │
├──────────────────────────────────────────┤
│  Planning Layer (Motion & Task Planning)│
├──────────────────────────────────────────┤
│  Control Layer (Actuator Commands)      │
└──────────────────────────────────────────┘
```

### Design Principles

1. **Modularity**: Each component is an independent ROS 2 node
2. **Robustness**: Handle sensor failures and unexpected inputs
3. **Safety**: Emergency stop and collision avoidance
4. **Testability**: Validate each layer independently

### Example: Object Pick-and-Place Pipeline

**Task**: Detect an object, grasp it, and place it in a target location.

**Pipeline**:
1. **Perception**: Camera detects object position
2. **Cognition**: Decide whether object is graspable
3. **Planning**: Compute arm trajectory to reach object
4. **Control**: Execute trajectory and close gripper

## Practical Application

### Project: Autonomous Object Sorter

**Objective**: Build a robot that sorts colored blocks into bins.

#### Step 1: Perception - Object Detection

```python
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import Image
from cv_bridge import CvBridge
import cv2
import numpy as np

class ObjectDetector(Node):
    def __init__(self):
        super().__init__('object_detector')
        self.subscription = self.create_subscription(
            Image, '/camera/image', self.image_callback, 10)
        self.publisher = self.create_publisher(
            DetectedObjects, '/detected_objects', 10)
        self.bridge = CvBridge()

    def image_callback(self, msg):
        # Convert ROS Image to OpenCV format
        cv_image = self.bridge.imgmsg_to_cv2(msg, 'bgr8')

        # Simple color-based detection (red blocks)
        hsv = cv2.cvtColor(cv_image, cv2.COLOR_BGR2HSV)
        lower_red = np.array([0, 100, 100])
        upper_red = np.array([10, 255, 255])
        mask = cv2.inRange(hsv, lower_red, upper_red)

        # Find contours
        contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL,
                                       cv2.CHAIN_APPROX_SIMPLE)

        # Publish detected objects
        objects = DetectedObjects()
        for contour in contours:
            x, y, w, h = cv2.boundingRect(contour)
            objects.objects.append(Object(x=x, y=y, color='red'))

        self.publisher.publish(objects)
```

#### Step 2: Cognition - Decision Making

```python
class TaskPlanner(Node):
    def __init__(self):
        super().__init__('task_planner')
        self.subscription = self.create_subscription(
            DetectedObjects, '/detected_objects', self.plan_callback, 10)
        self.publisher = self.create_publisher(
            TaskGoal, '/task_goal', 10)

    def plan_callback(self, msg):
        if len(msg.objects) == 0:
            return  # No objects detected

        # Pick closest object
        closest_obj = min(msg.objects, key=lambda obj: obj.x**2 + obj.y**2)

        # Determine target bin based on color
        target_bin = self.get_bin_for_color(closest_obj.color)

        # Publish task goal
        goal = TaskGoal()
        goal.action = 'pick_and_place'
        goal.object_position = [closest_obj.x, closest_obj.y]
        goal.target_position = target_bin
        self.publisher.publish(goal)

    def get_bin_for_color(self, color):
        bins = {'red': [1.0, 0.0], 'blue': [-1.0, 0.0]}
        return bins.get(color, [0.0, 0.0])
```

#### Step 3: Planning - Motion Planning

```python
from moveit_msgs.msg import MoveGroupActionGoal

class MotionPlanner(Node):
    def __init__(self):
        super().__init__('motion_planner')
        self.subscription = self.create_subscription(
            TaskGoal, '/task_goal', self.plan_motion, 10)
        self.moveit_client = ActionClient(self, MoveGroup, 'move_group')

    def plan_motion(self, goal):
        # Convert object position to 3D coordinates
        target_pose = self.pixel_to_world(goal.object_position)

        # Create MoveIt goal
        moveit_goal = MoveGroupActionGoal()
        moveit_goal.request.group_name = 'manipulator'
        moveit_goal.request.target_pose = target_pose

        # Send goal to MoveIt
        self.moveit_client.send_goal_async(moveit_goal)

    def pixel_to_world(self, pixel_coords):
        # Camera calibration: convert 2D pixel to 3D world coordinates
        # Simplified example
        x = pixel_coords[0] * 0.001  # Scale factor
        y = pixel_coords[1] * 0.001
        z = 0.5  # Fixed height above table
        return [x, y, z]
```

#### Step 4: Control - Execution

```python
class RobotController(Node):
    def __init__(self):
        super().__init__('robot_controller')
        self.joint_pub = self.create_publisher(
            JointTrajectory, '/joint_trajectory', 10)
        self.gripper_pub = self.create_publisher(
            GripperCommand, '/gripper_command', 10)

    def execute_trajectory(self, trajectory):
        # Publish joint trajectory
        self.joint_pub.publish(trajectory)

    def close_gripper(self):
        cmd = GripperCommand()
        cmd.position = 0.0  # Fully closed
        self.gripper_pub.publish(cmd)

    def open_gripper(self):
        cmd = GripperCommand()
        cmd.position = 0.08  # Fully open
        self.gripper_pub.publish(cmd)
```

### Integration: Launch File

```python
from launch import LaunchDescription
from launch_ros.actions import Node

def generate_launch_description():
    return LaunchDescription([
        # Perception
        Node(
            package='my_robot',
            executable='object_detector',
            name='object_detector'
        ),
        # Cognition
        Node(
            package='my_robot',
            executable='task_planner',
            name='task_planner'
        ),
        # Planning
        Node(
            package='my_robot',
            executable='motion_planner',
            name='motion_planner'
        ),
        # Control
        Node(
            package='my_robot',
            executable='robot_controller',
            name='robot_controller'
        ),
        # Simulation
        Node(
            package='gazebo_ros',
            executable='spawn_entity.py',
            arguments=['-file', 'robot.urdf', '-entity', 'my_robot']
        )
    ])
```

### Testing the Pipeline

```bash
# 1. Launch Gazebo simulation
ros2 launch gazebo_ros gazebo.launch.py

# 2. Launch the complete pipeline
ros2 launch my_robot object_sorter.launch.py

# 3. Monitor system
ros2 node list
ros2 topic echo /detected_objects
ros2 topic echo /task_goal

# 4. Visualize in RViz
ros2 run rviz2 rviz2
```

## Best Practices

### 1. Safety First

- Implement **emergency stop**: Hardware button to halt all motion
- Add **collision detection**: Monitor force sensors and stop on contact
- Use **velocity limits**: Cap maximum joint speeds
- Test in **simulation** before deploying to hardware

### 2. Robust Error Handling

```python
def safe_execute(self, action):
    try:
        result = self.execute_action(action)
        return result
    except Exception as e:
        self.get_logger().error(f'Execution failed: {e}')
        self.emergency_stop()
        return None
```

### 3. Modular Design

- One node = one responsibility
- Use well-defined message interfaces
- Avoid tight coupling between components

### 4. Testing Strategy

1. **Unit tests**: Test individual nodes in isolation
2. **Integration tests**: Verify communication between nodes
3. **System tests**: Run full pipeline in simulation
4. **Hardware tests**: Deploy to real robot incrementally

## Summary

Building an AI-robot pipeline requires integrating perception, cognition, planning, and control into a cohesive system. ROS 2 provides the framework for modular, scalable robotics software.

This capstone project demonstrates how concepts from all previous chapters—Physical AI, mechanics, ROS 2, simulation, and VLA models—come together to create intelligent, autonomous systems.

**Key Takeaways:**
- AI-robot pipelines consist of perception, cognition, planning, and control layers
- ROS 2 enables modular architecture with independent nodes
- Safety and robustness are critical for real-world deployment
- Test in simulation before deploying to hardware

## Further Reading

- **Project Ideas**:
  - Autonomous navigation with obstacle avoidance
  - Visual servoing for precise manipulation
  - Multi-robot coordination for warehouse tasks

- **Advanced Topics**:
  - **Behavior trees** for complex task planning
  - **Model Predictive Control** for optimal trajectory execution
  - **Multi-sensor fusion** with Kalman filters

- **Open-Source Projects**:
  - [MoveIt 2](https://moveit.ros.org/) - Motion planning framework
  - [Navigation2](https://navigation.ros.org/) - Autonomous navigation
  - [Manipulation](https://github.com/ros-planning/moveit2_tutorials) - Pick-and-place tutorials

- **Communities**:
  - [ROS Discourse](https://discourse.ros.org/)
  - [Physical AI Slack Groups](https://physicalintelligence.slack.com/)
  - [Robotics Stack Exchange](https://robotics.stackexchange.com/)

---

**Congratulations!** You've completed the Physical AI & Humanoid Robotics essentials course. You now have the foundational knowledge to design, build, and deploy AI-powered robotic systems.

**Next Steps:**
1. Build your own project using the concepts learned
2. Contribute to open-source robotics projects
3. Explore advanced topics in reinforcement learning and control theory
4. Join the Physical AI community and share your work
