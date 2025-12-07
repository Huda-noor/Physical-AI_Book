---
id: chapter-3-ros-2-fundamentals
title: Chapter 3 - ROS 2 Fundamentals
sidebar_label: 3. ROS 2 Fundamentals
sidebar_position: 3
---

# Chapter 3: ROS 2 Fundamentals

## Learning Objectives

By the end of this chapter, you will be able to:

- Understand the ROS 2 architecture and its core components
- Create and manage ROS 2 nodes, topics, and services
- Write basic publisher/subscriber programs in Python
- Navigate the ROS 2 ecosystem and command-line tools

## Introduction

**Robot Operating System (ROS 2)** is the industry-standard middleware for building robot software. It provides tools, libraries, and conventions for developing modular, reusable robot applications.

ROS 2 is a complete redesign of ROS 1, with improvements in real-time performance, security, and multi-robot support. It's used in research labs, startups, and production systems worldwide.

## Core Concepts

### ROS 2 Architecture

ROS 2 uses a **distributed architecture** where independent programs (nodes) communicate over well-defined interfaces.

#### Key Components:

1. **Nodes**: Independent processes that perform specific tasks
2. **Topics**: Named channels for asynchronous message passing
3. **Services**: Synchronous request-response communication
4. **Actions**: Long-running tasks with feedback
5. **Parameters**: Configuration values for nodes

### Nodes

A **node** is a single executable that performs one function (e.g., reading a camera, controlling a motor, planning a path).

**Design Philosophy**: One node = one responsibility

Example nodes in a mobile robot:
- `camera_driver`: Publishes camera images
- `object_detector`: Detects objects in images
- `navigation`: Plans paths and sends velocity commands
- `motor_controller`: Converts velocity to motor commands

### Topics and Messages

**Topics** enable publish-subscribe communication:

- **Publishers** send messages to a topic
- **Subscribers** receive messages from a topic
- Messages are typed (e.g., `sensor_msgs/Image`, `geometry_msgs/Twist`)

```
┌─────────┐         Topic: /camera/image        ┌─────────┐
│ Camera  │ ──────────────────────────────────> │ Detector│
│  Node   │  (sensor_msgs/Image)                │  Node   │
└─────────┘                                     └─────────┘
```

### Services

**Services** provide synchronous request-response communication:

- **Client** sends a request and waits for a response
- **Server** processes the request and returns a result

Use cases: Query robot state, trigger one-time actions

```python
# Service call example (pseudocode)
response = client.call_async(request)
result = response.result()
```

### Actions

**Actions** are for long-running tasks that need:

- **Goal**: What to achieve
- **Feedback**: Progress updates
- **Result**: Final outcome

Example: "Navigate to position (x, y)" with periodic position feedback.

## Practical Application

### Example 1: Simple Publisher (Python)

```python
import rclpy
from rclpy.node import Node
from std_msgs.msg import String

class MinimalPublisher(Node):
    def __init__(self):
        super().__init__('minimal_publisher')
        self.publisher_ = self.create_publisher(String, 'topic', 10)
        self.timer = self.create_timer(1.0, self.timer_callback)
        self.count = 0

    def timer_callback(self):
        msg = String()
        msg.data = f'Hello World: {self.count}'
        self.publisher_.publish(msg)
        self.get_logger().info(f'Publishing: "{msg.data}"')
        self.count += 1

def main(args=None):
    rclpy.init(args=args)
    node = MinimalPublisher()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

**Explanation:**
1. Create a node called `minimal_publisher`
2. Create a publisher on the `topic` topic with a queue size of 10
3. Use a timer to publish a message every 1 second
4. `rclpy.spin()` keeps the node running

### Example 2: Simple Subscriber (Python)

```python
import rclpy
from rclpy.node import Node
from std_msgs.msg import String

class MinimalSubscriber(Node):
    def __init__(self):
        super().__init__('minimal_subscriber')
        self.subscription = self.create_subscription(
            String,
            'topic',
            self.listener_callback,
            10)

    def listener_callback(self, msg):
        self.get_logger().info(f'Received: "{msg.data}"')

def main(args=None):
    rclpy.init(args=args)
    node = MinimalSubscriber()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

**Explanation:**
1. Create a subscriber on the `topic` topic
2. Register `listener_callback` to handle incoming messages
3. Print received messages to the console

### Running the Example

```bash
# Terminal 1: Run publisher
ros2 run my_package publisher

# Terminal 2: Run subscriber
ros2 run my_package subscriber

# Terminal 3: Inspect topics
ros2 topic list
ros2 topic echo /topic
```

### Command-Line Tools

```bash
# List all nodes
ros2 node list

# List all topics
ros2 topic list

# Get info about a topic
ros2 topic info /camera/image

# Echo messages from a topic
ros2 topic echo /camera/image

# Call a service
ros2 service call /service_name service_type "{request_data}"

# View node graph
ros2 run rqt_graph rqt_graph
```

## Summary

ROS 2 provides a powerful framework for building modular robot systems. Its pub-sub architecture enables loose coupling between components, making systems easier to develop, test, and scale.

Understanding nodes, topics, and services is essential for working with any ROS 2-based robot platform, from academic research robots to commercial humanoids.

**Key Takeaways:**
- ROS 2 uses a distributed architecture with independent nodes
- Topics enable asynchronous publish-subscribe communication
- Services provide synchronous request-response patterns
- Python and C++ are the primary languages for ROS 2 development

## Further Reading

- **Official Documentation**:
  - [ROS 2 Documentation](https://docs.ros.org/en/humble/)
  - [ROS 2 Tutorials](https://docs.ros.org/en/humble/Tutorials.html)

- **Books**:
  - *A Concise Introduction to Robot Programming with ROS 2* by Francisco Martín Rico
  - *Programming Robots with ROS* by Morgan Quigley et al.

- **Online Courses**:
  - [ROS 2 for Beginners](https://www.udemy.com/topic/ros/)
  - [The Construct ROS Learning Platform](https://www.theconstructsim.com/)

- **Community**:
  - [ROS Discourse Forum](https://discourse.ros.org/)
  - [ROS Answers](https://answers.ros.org/)
