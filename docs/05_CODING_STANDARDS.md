# ============================================================================
# ENTERPRISE AUTONOMOUS PSEO ENGINE
# CODING STANDARDS
#
# Version : 2.0
# Status  : Production Ready
# ============================================================================

# PURPOSE

This document defines the official coding standards used throughout the
Enterprise Autonomous PSEO Engine.

Every AI provider

(ChatGPT)

(Gemini)

(Claude)

(Codex)

(Qwen)

(DeepSeek)

(GLM)

must generate code according to these standards.

These standards are mandatory.

------------------------------------------------------------------------------

# CORE PHILOSOPHY

Readable code

↓

Predictable code

↓

Maintainable code

↓

Scalable code

↓

Reusable code

↓

Enterprise code

Never optimize only for fewer lines.

Optimize for humans.

------------------------------------------------------------------------------

# LANGUAGE

Primary

JavaScript ES2023

Future

TypeScript Compatible

Node Compatible

Browser Compatible

------------------------------------------------------------------------------

# MODULE SYSTEM

Always

ES Modules

Use

import

export

Never

require()

module.exports

------------------------------------------------------------------------------

# FILE HEADER

Every file starts with

/**
 * Module:
 * Purpose:
 * Responsibilities:
 * Dependencies:
 * Owner:
 * Version:
 */

Example

/**
 * Module: Knowledge Engine
 * Purpose: Creates runtime knowledge objects.
 * Responsibilities:
 *   - Normalize datasets
 *   - Build Knowledge Graph
 * Dependencies:
 *   - Dataset Engine
 *   - Validation Engine
 */

------------------------------------------------------------------------------

# FILE SIZE

Target

200–400 lines

Maximum

600 lines

If larger

Split module.

Never create giant files.

------------------------------------------------------------------------------

# CLASS RULES

One class

↓

One responsibility

Never

Mega Classes

God Objects

------------------------------------------------------------------------------

Example

KnowledgeEngine

ValidationEngine

WeatherEngine

WriterEngine

Good

Bad

UtilityEngineEverything

------------------------------------------------------------------------------

# FUNCTION RULES

Every function

↓

One responsibility

One input

One output

Pure whenever possible.

Target

10–40 lines

Maximum

80 lines

------------------------------------------------------------------------------

# FUNCTION NAMES

camelCase

Good

loadCities()

buildKnowledge()

validateDataset()

generateContext()

Bad

doEverything()

process()

run()

executeAll()

------------------------------------------------------------------------------

# VARIABLE NAMES

Always descriptive.

Good

cityKnowledge

knowledgeGraph

validationResult

internalLinks

Bad

x

a

tmp

obj

------------------------------------------------------------------------------

# CONSTANTS

UPPER_CASE

Example

MAX_CACHE_SIZE

DEFAULT_TIMEOUT

SUPPORTED_COUNTRIES

------------------------------------------------------------------------------

# BOOLEANS

Always start with

is

has

can

should

Example

isValid

hasWeather

canDeploy

shouldGenerate

------------------------------------------------------------------------------

# ARRAYS

Plural names.

cities

keywords

landmarks

services

Never

cityArray

keywordListData

------------------------------------------------------------------------------

# OBJECTS

Singular.

city

service

project

weather

------------------------------------------------------------------------------

# ENUM STYLE

Example

ValidationStatus

PASS

WARNING

ERROR

FATAL

Never

1

2

3

4

Magic numbers forbidden.

------------------------------------------------------------------------------

# IMPORT ORDER

1

Node Modules

↓

2

Internal Modules

↓

3

Utilities

↓

4

Configuration

↓

5

Types

Keep imports sorted.

------------------------------------------------------------------------------

# EXPORT RULES

Prefer

Named Exports

Example

export class WriterEngine

export function validate()

Avoid default exports unless clearly justified.

------------------------------------------------------------------------------

# COMMENTS

Explain

WHY

Never explain

WHAT

Bad

Increment i

Good

Increment retry count because API rate limits require exponential backoff.

------------------------------------------------------------------------------

# MAGIC VALUES

Forbidden.

Never

200

5000

100

inside code.

Use constants.

------------------------------------------------------------------------------

# CONFIGURATION

Everything configurable.

Never hardcode

Phone

API Keys

Domains

Business Name

Service List

State List

Weather Provider

AI Provider

------------------------------------------------------------------------------

# ERROR HANDLING

Never

catch {}

Never ignore errors.

Always

Log

↓

Explain

↓

Recover

↓

Stop if fatal

------------------------------------------------------------------------------

# LOGGING

Structured only.

Every log includes

Timestamp

Module

Severity

Message

Context

Trace ID

Never console.log() in production modules.

------------------------------------------------------------------------------

# FINAL PRINCIPLE

Good code is predictable.

Predictable code scales.

Enterprise software is built by consistency,
not cleverness.

# ============================================================================
# END OF CODING_STANDARDS
# PART 1
# ============================================================================

# ============================================================================
# CODING STANDARDS
# PART 2
# FOLDER
# FILE
# MODULE
# NAMING STANDARDS
# ============================================================================

# PURPOSE

This document standardizes

Folder Names

↓

File Names

↓

Module Names

↓

Engine Names

↓

Builder Names

↓

Validator Names

↓

Adapters

↓

Plugins

↓

Utilities

Every AI provider must follow these conventions.

------------------------------------------------------------------------------

# DIRECTORY NAMING

Directories use

lowercase

Single words when possible.

Multiple words

↓

kebab-case

Examples

good

core/

builders/

validators/

deployment/

knowledge/

context/

weather/

maps/

shared/

plugins/

bad

Core/

KnowledgeEngine/

WeatherEngine/

My Folder/

Data_Files/

------------------------------------------------------------------------------

# FILE NAMING

Every file uses

kebab-case

Examples

knowledge-engine.js

validation-engine.js

weather-engine.js

relationship-builder.js

internal-link-engine.js

prompt-builder.js

good

seo-engine.js

bad

SeoEngine.js

seoEngine.js

SEO_ENGINE.js

------------------------------------------------------------------------------

# DATA FILES

State datasets

lowercase state code

Examples

ca.json

tx.json

fl.json

ny.json

Never

California.json

TX.JSON

Texas.json

------------------------------------------------------------------------------

# SERVICE FILES

Use service slug.

Examples

pest-control.json

rodent-control.json

mosquito-control.json

hvac.json

garage-door.json

------------------------------------------------------------------------------

# TEMPLATE FILES

hero-template.json

faq-template.json

review-template.json

cta-template.json

Never

Template1.json

HeroTemplate.json

------------------------------------------------------------------------------

# COMPONENT FILES

Components

PascalCase

because they represent UI components.

Examples

Hero.jsx

CallButton.jsx

WeatherWidget.jsx

MapWidget.jsx

FaqSection.jsx

Breadcrumbs.jsx

------------------------------------------------------------------------------

# JAVASCRIPT MODULES

Infrastructure

↓

kebab-case

UI Components

↓

PascalCase

Configuration

↓

kebab-case

Data

↓

lowercase

------------------------------------------------------------------------------

# ENGINE NAMING

Every engine ends with

Engine

Examples

KnowledgeEngine

WriterEngine

SeoEngine

ValidationEngine

DeploymentEngine

DashboardEngine

Never abbreviate.

------------------------------------------------------------------------------

# BUILDER NAMING

Every builder ends with

Builder

Examples

RelationshipBuilder

PromptBuilder

SchemaBuilder

NavigationBuilder

ContextBuilder

------------------------------------------------------------------------------

# VALIDATOR NAMING

Every validator ends with

Validator

Examples

DatasetValidator

SeoValidator

SchemaValidator

ContextValidator

PageValidator

------------------------------------------------------------------------------

# ADAPTER NAMING

Every adapter ends with

Adapter

Examples

OpenAiAdapter

GeminiAdapter

ClaudeAdapter

DeepSeekAdapter

CloudflareAdapter

WeatherAdapter

MapsAdapter

------------------------------------------------------------------------------

# MANAGER NAMING

Every manager ends with

Manager

Examples

CacheManager

PluginManager

ProjectManager

BuildManager

QueueManager

------------------------------------------------------------------------------

# PROVIDER NAMING

Every provider ends with

Provider

Examples

WeatherProvider

MapsProvider

AiProvider

SearchProvider

AnalyticsProvider

------------------------------------------------------------------------------

# FACTORY NAMING

Every factory ends with

Factory

Examples

EngineFactory

PromptFactory

WidgetFactory

ProviderFactory

------------------------------------------------------------------------------

# EVENT NAMING

Events use

Past tense

Examples

datasetLoaded

knowledgeBuilt

contextCreated

contentGenerated

seoCompleted

deploymentFinished

Never

runEngine

buildEverything

------------------------------------------------------------------------------

# CONFIG FILES

Every configuration ends with

.config.js

Examples

site.config.js

seo.config.js

maps.config.js

weather.config.js

ads.config.js

dashboard.config.js

------------------------------------------------------------------------------

# TEST FILES

Suffix

.test.js

Examples

knowledge-engine.test.js

schema-validator.test.js

writer-engine.test.js

------------------------------------------------------------------------------

# MOCK FILES

Suffix

.mock.js

Examples

weather.mock.js

maps.mock.js

knowledge.mock.js

------------------------------------------------------------------------------

# FIXTURE FILES

Suffix

.fixture.json

Examples

city.fixture.json

service.fixture.json

faq.fixture.json

------------------------------------------------------------------------------

# CSS FILES

kebab-case

Examples

hero.css

weather-widget.css

call-button.css

dashboard.css

------------------------------------------------------------------------------

# IMAGE FILES

lowercase

hyphen separated

Examples

hero-banner.webp

weather-icon.svg

company-logo.png

------------------------------------------------------------------------------

# ASSET FOLDERS

Organize by type.

assets/

images/

icons/

fonts/

logos/

videos/

------------------------------------------------------------------------------

# IMPORT PATHS

Prefer absolute aliases where configured.

Example

@core/

@builders/

@validators/

@shared/

Avoid deep relative imports when aliases are available.

------------------------------------------------------------------------------

# RESERVED NAMES

Never create files named

temp.js

new.js

old.js

copy.js

final.js

test2.js

backup.js

Use meaningful names only.

------------------------------------------------------------------------------

# FINAL PRINCIPLE

Names communicate architecture.

A developer should understand a module's purpose
by reading its name alone.

Consistency is more important than creativity.

# ============================================================================
# END OF CODING_STANDARDS
# PART 2
# ============================================================================


# ============================================================================
# CODING STANDARDS
# PART 3
# FUNCTIONS
# ERROR HANDLING
# LOGGING
# PERFORMANCE
# ============================================================================

# PURPOSE

This chapter defines how production-quality code must be written.

Every function, class, module and engine must follow these rules.

Working code is not enough.

Enterprise-quality code is required.

------------------------------------------------------------------------------

# FUNCTION PHILOSOPHY

Every function should answer one question only.

One Responsibility

↓

One Input

↓

One Output

↓

One Purpose

Never create functions that perform multiple unrelated operations.

------------------------------------------------------------------------------

# FUNCTION SIZE

Recommended

10–30 lines

Preferred Maximum

50 lines

Hard Maximum

80 lines

If larger

↓

Split into helper functions.

------------------------------------------------------------------------------

# FUNCTION DESIGN

Every function should

Receive data

↓

Validate

↓

Execute

↓

Return result

Never modify unrelated objects.

------------------------------------------------------------------------------

# PURE FUNCTIONS

Prefer pure functions whenever possible.

Good

Input

↓

Process

↓

Return

Bad

Hidden globals

↓

Random mutations

↓

Side effects

------------------------------------------------------------------------------

# SIDE EFFECTS

Keep side effects isolated.

Allowed

Logging

Network Requests

File System

Cache Updates

Database Writes (Future)

Everything else should remain pure.

------------------------------------------------------------------------------

# RETURN VALUES

Every function returns

One predictable result.

Never mix

Boolean

String

Object

Null

for the same function.

Example

Always

ValidationResult

Never

true

false

"error"

null

------------------------------------------------------------------------------

# ASYNC RULES

Always use

async / await

Avoid

Nested Promise chains

Avoid callback-style code.

------------------------------------------------------------------------------

# PARALLEL EXECUTION

Use parallel execution only when

Tasks are independent.

Example

Load Weather

+

Load Maps

+

Load Business Config

↓

Parallel

Do not parallelize dependent operations.

------------------------------------------------------------------------------

# ERROR HANDLING

Every possible failure must be handled.

Never ignore errors.

Never swallow exceptions.

------------------------------------------------------------------------------

# ERROR OBJECT

Every error includes

Error ID

↓

Message

↓

Module

↓

Severity

↓

Timestamp

↓

Stack

↓

Suggested Fix

↓

Recovery Action

------------------------------------------------------------------------------

# ERROR SEVERITY

INFO

No action required.

WARNING

Continue.

ERROR

Current module stops.

FATAL

Entire build stops.

------------------------------------------------------------------------------

# TRY / CATCH

Catch only when recovery is possible.

If recovery is impossible

↓

Propagate the error.

Never hide failures.

------------------------------------------------------------------------------

# LOGGING STANDARD

Use structured logging.

Every log entry includes

Timestamp

↓

Module

↓

Engine

↓

Severity

↓

Message

↓

Trace ID

↓

Project ID

↓

Build ID

↓

Context

Never use anonymous logs.

------------------------------------------------------------------------------

# LOG LEVELS

DEBUG

Development only.

INFO

Normal operation.

WARNING

Potential problem.

ERROR

Operation failed.

FATAL

Build terminated.

------------------------------------------------------------------------------

# SECURITY LOGGING

Never log

Passwords

API Keys

Tokens

Secrets

Private Credentials

Personally Identifiable Information

Sensitive business information.

------------------------------------------------------------------------------

# PERFORMANCE PHILOSOPHY

Fast code

is good.

Predictable performance

is better.

Optimize only after correctness.

------------------------------------------------------------------------------

# MEMORY MANAGEMENT

Release temporary objects.

Avoid unnecessary copies.

Reuse runtime caches.

Prevent memory leaks.

Avoid retaining unused references.

------------------------------------------------------------------------------

# CACHE USAGE

Cache only

Validated

Deterministic

Reusable

Data.

Never cache

Errors

Incomplete Objects

Sensitive Information

------------------------------------------------------------------------------

# LOOP STANDARDS

Prefer

for...of

or

Array methods

Avoid deeply nested loops.

Target

Maximum nesting depth

3

------------------------------------------------------------------------------

# RECURSION

Use recursion only when

it clearly improves readability.

Always define

termination conditions.

------------------------------------------------------------------------------

# DEPENDENCY INJECTION

Never instantiate dependencies inside business logic when injection is appropriate.

Prefer

Constructor Injection

or

Factory Injection

This improves testing and flexibility.

------------------------------------------------------------------------------

# CONFIGURATION ACCESS

Read configuration through

Configuration Engine.

Never access configuration files directly throughout the codebase.

------------------------------------------------------------------------------

# TIMEOUTS

Every external request must define

Timeout

Retry Strategy

Fallback Strategy

Never wait indefinitely.

------------------------------------------------------------------------------

# RETRIES

Retry only for

Temporary failures.

Never retry

Validation Errors

Programming Errors

Schema Errors

------------------------------------------------------------------------------

# PERFORMANCE TARGETS

Function execution

↓

Fast and predictable

Memory usage

↓

Stable

Cache hit rate

↓

High

Build performance

↓

Incremental

No unnecessary work.

------------------------------------------------------------------------------

# CODE REVIEW CHECKLIST

Before completing a feature verify

Single Responsibility

Readable Names

No Magic Values

Structured Logging

Proper Error Handling

Configuration Driven

Tests Updated

Documentation Updated

No Dead Code

No Duplicate Logic

------------------------------------------------------------------------------

# FINAL PRINCIPLE

Readable code survives.

Predictable code scales.

Well-tested code earns trust.

Enterprise software is measured not by how quickly it is written,
but by how reliably it can evolve.

# ============================================================================
# END OF CODING_STANDARDS
# PART 3
# ============================================================================

# ============================================================================
# CODING STANDARDS
# PART 4
# AI CODE GENERATION STANDARDS
# ============================================================================

# PURPOSE

This document defines how AI generates code.

Different AI providers generate code differently.

This specification standardizes

Output

↓

Files

↓

Updates

↓

Reviews

↓

Git Messages

↓

Validation

Every AI must follow this workflow.

------------------------------------------------------------------------------

# AI ROLE

The AI is not a chatbot.

The AI is a Senior Software Engineer.

The AI must think before writing code.

Architecture first.

Code second.

------------------------------------------------------------------------------

# BEFORE WRITING CODE

The AI must verify

Architecture

↓

Dependencies

↓

Data Contracts

↓

JSON Schemas

↓

Existing Modules

↓

Naming Standards

↓

Project Decisions

If anything is unclear

Stop.

Ask the user.

Never guess.

------------------------------------------------------------------------------

# IMPLEMENTATION STRATEGY

Every task follows

Understand

↓

Plan

↓

Validate

↓

Implement

↓

Self Review

↓

Test

↓

Deliver

Never skip planning.

------------------------------------------------------------------------------

# FILE CREATION RULES

Create new files only if

Required

Approved by architecture

No existing module owns the responsibility

Never create duplicate modules.

------------------------------------------------------------------------------

# FILE UPDATE RULES

When modifying existing files

Preserve

Public API

↓

Architecture

↓

Naming

↓

Formatting

↓

Comments

Never rewrite unrelated code.

------------------------------------------------------------------------------

# PATCH STRATEGY

Preferred

Small targeted updates.

Avoid rewriting complete files

unless

Architecture changes

or

User requests full regeneration.

------------------------------------------------------------------------------

# FULL FILE REGENERATION

Allowed only when

User explicitly requests

or

Existing implementation is fundamentally incorrect.

Otherwise

Provide focused updates.

------------------------------------------------------------------------------

# OUTPUT ORDER

Every implementation response must follow

1.

Summary

2.

Files Created

3.

Files Updated

4.

Architecture Notes

5.

Complete Code

6.

Explanation

7.

Validation

8.

Testing Notes

9.

Git Commit Message

Always in this order.

------------------------------------------------------------------------------

# FILE HEADER

Every generated file starts with

Module

Purpose

Responsibilities

Dependencies

Version

Author

Never omit headers.

------------------------------------------------------------------------------

# CODE BLOCKS

Provide

Complete files.

Avoid partial snippets

unless

User explicitly requests only a snippet.

Never omit imports.

Never omit exports.

------------------------------------------------------------------------------

# SELF REVIEW

Before responding

Verify

Compilation

↓

Architecture

↓

Naming

↓

Performance

↓

Security

↓

Accessibility

↓

SEO

↓

Documentation

↓

Consistency

Fix issues before responding.

------------------------------------------------------------------------------

# DUPLICATE DETECTION

Before creating

Class

Function

Module

Engine

Validator

Builder

Search existing architecture.

Never duplicate responsibilities.

------------------------------------------------------------------------------

# IMPORT VALIDATION

Every import must exist.

No broken imports.

No circular imports.

No unused imports.

------------------------------------------------------------------------------

# EXPORT VALIDATION

Every exported object

must have

exactly one responsibility.

Avoid wildcard exports unless justified.

------------------------------------------------------------------------------

# DOCUMENTATION

Every new module includes

Purpose

Public API

Example Usage

Dependencies

Known Limitations

Future Extension Points

Documentation is part of implementation.

------------------------------------------------------------------------------

# TESTING

Every feature should include

Recommended Unit Tests

Recommended Integration Tests

Edge Cases

Failure Cases

Performance Considerations

If tests are not implemented,

state that clearly.

------------------------------------------------------------------------------

# GIT OUTPUT

Every response ends with

Branch Name

↓

Commit Message

↓

Affected Files

↓

Version Suggestion

Example

Branch

feature/context-engine

Commit

feat(context): add runtime context builder

------------------------------------------------------------------------------

# USER APPROVAL

Require approval before

Architecture changes

↓

Breaking changes

↓

File deletions

↓

Dataset modifications

↓

Public API changes

Never perform them automatically.

------------------------------------------------------------------------------

# FINAL PRINCIPLE

AI should produce production-ready software.

Not demonstrations.

Not prototypes.

Not examples.

Every response should be suitable for immediate inclusion
in the project repository after review.

# ============================================================================
# END OF CODING_STANDARDS
# PART 4
# ============================================================================