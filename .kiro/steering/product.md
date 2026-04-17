# MPSEDC Government Scheme Application Tracker

## Product Overview

A full-stack web application for managing government scheme applications with comprehensive workflow management, role-based access control, and audit logging.

## Core Purpose

Enable government officers to efficiently manage citizen applications for various government schemes (PM Kisan, Ladli Behna, Ayushman Bharat, PM Awas Yojana, Sambal Yojana) with proper authorization, workflow transitions, and complete audit trails.

## Key Features

- **User Authentication**: Secure JWT-based login with role-based access (Admin/User)
- **Application Management**: Full CRUD operations for scheme applications
- **Workflow Management**: Draft → Review → Approved status transitions with role-based permissions
- **Dashboard**: Real-time statistics and analytics for administrators
- **CSV Export**: Export application data for reporting
- **Audit Logging**: Complete transaction history for compliance
- **Responsive Design**: Works on desktop and mobile devices
- **PWA Support**: Installable as mobile app

## User Roles

- **Admin**: Full access to all applications, schemes, dashboard, and audit logs
- **User**: Can only view/manage their own applications, limited status transitions

## Application Workflow

Applications follow a strict state machine:
- **Draft**: Initial state, editable, only creator can modify
- **Review**: Under review, cannot be edited, only admins can transition
- **Approved**: Final state, locked, cannot be modified or deleted

## Key Business Rules

1. Only Draft applications can be deleted
2. Approved applications are immutable
3. Users can only see their own applications
4. Admins can see all applications
5. Status transitions are role-dependent and validated
6. All actions are logged for audit purposes
