# ============================================================================
# ENTERPRISE AUTONOMOUS PSEO ENGINE
# JSON SCHEMA SPECIFICATION
#
# Version : 2.0
# Status  : Production Ready
# ============================================================================

# PURPOSE

This document defines the official JSON standards used by the Enterprise
Autonomous Programmatic SEO Engine.

Every dataset must comply with these standards.

These schemas are permanent contracts.

AI must never violate them.

------------------------------------------------------------------------------

# SCHEMA PHILOSOPHY

JSON is not merely data.

JSON represents business knowledge.

Every object has

Meaning

Relationships

Ownership

Validation

Lifecycle

Every dataset is treated as an API Contract.

------------------------------------------------------------------------------

# SINGLE SOURCE OF TRUTH

Every JSON file belongs to

src/data/

No JSON outside this directory should contain business data.

------------------------------------------------------------------------------

# SUPPORTED DATASETS

states/

cities/

services/

keywords/

faqs/

templates/

shared/

business/

schema/

future datasets

------------------------------------------------------------------------------

# FILE FORMAT

Only

UTF-8

LF

JSON

No comments.

No trailing commas.

No duplicate keys.

------------------------------------------------------------------------------

# NAMING RULES

Files

↓

lowercase

Example

ca.json

tx.json

hvac.json

Not

California.JSON

Texas.Json

HVAC.JSON

------------------------------------------------------------------------------

# OBJECT NAMING

Allowed

camelCase

Example

zipCodes

nearbyCities

housingProfile

growthPattern

serviceEnvironment

Never

Zip_Codes

zip_codes2

ZIPCODE

------------------------------------------------------------------------------

# ARRAY RULES

Arrays always contain

Objects

or

Primitive values

Never mix both.

Correct

[
  "90001",
  "90002"
]

Correct

[
  {
      "city":"Aurora"
  }
]

Wrong

[
  "90001",
  {
      "city":"Aurora"
  }
]

------------------------------------------------------------------------------

# STRING RULES

Strings

UTF-8

Trimmed

No HTML

No Markdown

No JavaScript

No embedded templates

------------------------------------------------------------------------------

# NUMBER RULES

Numbers remain numbers.

Never store

Population

Latitude

Longitude

Priority

Sort Order

as strings.

Correct

291247

Wrong

"291247"

------------------------------------------------------------------------------

# BOOLEAN RULES

Only

true

false

Never

"true"

"false"

1

0

------------------------------------------------------------------------------

# NULL RULES

Use null

only when

information genuinely unknown.

Do not replace missing values

with

"N/A"

"-"

"Unknown"

------------------------------------------------------------------------------

# REQUIRED FIELDS

Required fields

must always exist.

Missing required fields

↓

Validation Error

↓

Build Failure

------------------------------------------------------------------------------

# OPTIONAL FIELDS

Optional fields

may be absent.

Their absence

must never break runtime.

------------------------------------------------------------------------------

# IMMUTABLE FIELDS

The following fields

must never change automatically

slug

city

state

zipCodes

county

IDs

canonical

------------------------------------------------------------------------------

# UNIQUE RULES

Globally unique

slug

Project unique

pageId

Dataset unique

recordId

Never duplicate.

------------------------------------------------------------------------------

# EMPTY VALUES

Allowed

[]

{}

null

Not allowed

""

for required values.

------------------------------------------------------------------------------

# VERSIONING

Every dataset

must include

schemaVersion

datasetVersion

engineVersion

createdAt

updatedAt

------------------------------------------------------------------------------

# VALIDATION LEVELS

Level 1

Syntax

↓

Level 2

Schema

↓

Level 3

Relationships

↓

Level 4

Knowledge

↓

Level 5

Runtime

↓

Ready

------------------------------------------------------------------------------

# FUTURE COMPATIBILITY

Schemas

must support

additional

countries

languages

niches

AI providers

deployment targets

without breaking compatibility.

------------------------------------------------------------------------------

# FINAL PRINCIPLE

JSON Schemas are contracts.

Never violate contracts.

Never silently change contracts.

Every future dataset must respect these standards.

# ============================================================================
# END OF JSON_SCHEMA
# PART 1
# ============================================================================


# ============================================================================
# JSON SCHEMA
# PART 2
# STATE SCHEMA
# CITY SCHEMA
# ============================================================================

# PURPOSE

This chapter defines the official schema contracts for

• State Dataset

• City Dataset

These contracts are permanent.

The AI must never change them.

------------------------------------------------------------------------------

# STATE DATASET

Directory

src/data/states/

One file

↓

One State

Example

states/

ca.json

tx.json

fl.json

ny.json

...

------------------------------------------------------------------------------

# STATE FILE CONTRACT

Each file represents one US State.

The file contains

County Information

State Metadata

Additional Geographic Information

The engine consumes this file.

The engine never edits this file.

------------------------------------------------------------------------------

# STATE FILE RULES

Exactly one state per file.

Never merge states.

Never split states.

Never rename state files.

Never create duplicate state files.

------------------------------------------------------------------------------

# STATE OBJECT RULES

Each state object may contain

State Name

State Code

County Objects

County Metadata

Descriptions

Population

Additional Attributes

The engine must preserve unknown fields.

Never delete unsupported fields.

------------------------------------------------------------------------------

# STATE VALIDATION

Every state file validates

↓

Readable JSON

↓

Valid UTF-8

↓

Valid Schema

↓

No Duplicate County Keys

↓

Relationship Ready

------------------------------------------------------------------------------

# CITY DATASET

Directory

src/data/cities/

Each file represents every city belonging to one state.

------------------------------------------------------------------------------

# CITY FILE RULES

Exactly one file

↓

One State

Never

LosAngeles.json

Chicago.json

Houston.json

Correct

ca.json

il.json

tx.json

------------------------------------------------------------------------------

# CITY ARRAY

Each city file contains

Array

↓

City Objects

The array order belongs to the user.

Never automatically reorder.

------------------------------------------------------------------------------

# CITY OBJECT

Every city object must represent one real city.

The object must remain stable forever.

------------------------------------------------------------------------------

# REQUIRED FIELDS

city

slug

county

population

zip_codes

nearby_cities

Missing required fields

↓

Fatal Validation Error

------------------------------------------------------------------------------

# OPTIONAL FIELDS

landmarks

latitude

longitude

climate_zone

terrain

economy_type

housing_profile

growth_pattern

property_mix

service_environment

tourism

industry

utilities

transportation

agriculture

wildlife

commercial_profile

risk_profile

Missing optional fields

↓

Validation Warning

Never fatal.

------------------------------------------------------------------------------

# CITY NAME

Human readable.

Correct

Los Angeles

New York

Chicago

Not

LA

NYC

CHI

------------------------------------------------------------------------------

# SLUG

Permanent.

Never changes.

Never regenerated.

Examples

los-angeles-ca

new-york-ny

chicago-il

Unique globally.

------------------------------------------------------------------------------

# COUNTY

Represents official county.

Never inferred.

Never guessed.

Always read from user dataset.

------------------------------------------------------------------------------

# POPULATION

Whole Number.

Correct

3898747

Wrong

3,898,747

Wrong

"3898747"

------------------------------------------------------------------------------

# ZIP CODES

Array

Correct

[
 "90001",
 "90002",
 "90003"
]

Never

"90001,90002"

------------------------------------------------------------------------------

# NEARBY CITIES

Array

Contains

Valid city references.

Every nearby city

must exist somewhere

inside

User Dataset.

Broken references

↓

Fatal Validation Error.

------------------------------------------------------------------------------

# LANDMARKS

Array

Contains

Real landmarks.

Duplicates not allowed.

Empty array allowed.

------------------------------------------------------------------------------

# COORDINATES

Latitude

↓

Decimal

Longitude

↓

Decimal

Never store as text.

------------------------------------------------------------------------------

# RELATIONSHIP RULES

One State

↓

Many Cities

One County

↓

Many Cities

One City

↓

Many ZIP Codes

One City

↓

Many Landmarks

One City

↓

Many Nearby Cities

------------------------------------------------------------------------------

# UNIQUENESS

Unique

Slug

Unique

Canonical URL

Unique

Knowledge ID

Duplicate Slugs

↓

Fatal Error

------------------------------------------------------------------------------

# PRESERVATION

The engine must never

Rename fields

Rename objects

Convert arrays

Convert numbers

Modify formatting

Overwrite values

The raw JSON belongs to the user.

------------------------------------------------------------------------------

# FUTURE FIELDS

Unknown fields

must always be preserved.

Never remove fields simply because

the engine does not currently use them.

This guarantees forward compatibility.

------------------------------------------------------------------------------

# SCHEMA COMPATIBILITY

The engine must remain compatible with

Future AI Providers

Future Countries

Future Niches

Future Services

Future Modules

without requiring changes to the

State Schema

or

City Schema.

------------------------------------------------------------------------------

# FINAL PRINCIPLE

State datasets define regions.

City datasets define locations.

The engine adapts to these schemas.

The schemas never adapt to the engine.

# ============================================================================
# END OF JSON_SCHEMA
# PART 2
# ============================================================================
# ============================================================================
# JSON SCHEMA
# PART 3
# SERVICE
# KEYWORDS
# FAQ
# TEMPLATE
# BUSINESS
# ============================================================================

# PURPOSE

This chapter defines every non-geographic dataset.

These datasets control

Business

SEO

Content

Templates

AI

The engine remains identical.

Only datasets change.

------------------------------------------------------------------------------

# SERVICE DATASET

Directory

src/data/services/

One service

↓

One JSON file

Examples

pest-control.json

rodent-control.json

mosquito-control.json

termite-control.json

flooring.json

roofing.json

plumbing.json

hvac.json

------------------------------------------------------------------------------

# SERVICE OBJECT

Every service represents

One business service.

The service dataset owns

Service Name

Category

Descriptions

Benefits

Commercial Intent

Related Services

Google Ads Rules

Schema Rules

Content Rules

SEO Rules

CTA Rules

------------------------------------------------------------------------------

# REQUIRED SERVICE FIELDS

serviceId

serviceSlug

serviceName

category

primaryKeyword

description

cta

schemaType

searchIntent

------------------------------------------------------------------------------

# OPTIONAL SERVICE FIELDS

secondaryKeywords

semanticKeywords

faqGroups

relatedServices

adsCategory

trustSignals

images

videos

pricing

seasonality

businessRules

------------------------------------------------------------------------------

# SERVICE RULES

One file

↓

One service

Never merge multiple services.

Never duplicate services.

Never rename serviceSlug.

------------------------------------------------------------------------------

# KEYWORD DATASET

Directory

src/data/keywords/

The keyword dataset owns

Primary Keywords

Secondary Keywords

Semantic Keywords

Commercial Keywords

Informational Keywords

Transactional Keywords

Negative Keywords

------------------------------------------------------------------------------

# KEYWORD OBJECT

Every keyword belongs to

Exactly one service.

The engine never stores

keywords globally.

Keywords are service specific.

------------------------------------------------------------------------------

# REQUIRED KEYWORD FIELDS

keyword

intent

priority

service

language

------------------------------------------------------------------------------

# OPTIONAL KEYWORD FIELDS

searchVolume

difficulty

cpc

competition

cluster

entity

synonyms

relatedQuestions

------------------------------------------------------------------------------

# SEARCH INTENT

Allowed

Informational

Commercial

Transactional

Navigational

Local

The Writer receives search intent.

Not raw keywords.

------------------------------------------------------------------------------

# FAQ DATASET

Directory

src/data/faqs/

FAQs belong to

Service

Business

Location

General

Never duplicate identical FAQs.

------------------------------------------------------------------------------

# FAQ OBJECT

Contains

Question

Answer

Intent

Category

Priority

Related Service

------------------------------------------------------------------------------

# REQUIRED FAQ FIELDS

question

answer

category

priority

------------------------------------------------------------------------------

# OPTIONAL FAQ FIELDS

relatedKeywords

relatedService

relatedCities

schemaEligible

------------------------------------------------------------------------------

# TEMPLATE DATASET

Directory

src/data/templates/

Templates never contain

Business Data.

Templates define structure only.

------------------------------------------------------------------------------

# TEMPLATE TYPES

Hero

CTA

FAQ

Review

Feature

Comparison

Service Section

Local Section

Footer

Email

Prompt

------------------------------------------------------------------------------

# TEMPLATE RULES

Templates

↓

Structure

Datasets

↓

Content

AI

↓

Writing

Never hardcode

Cities

Services

Business Information

inside templates.

------------------------------------------------------------------------------

# BUSINESS DATASET

Directory

src/data/shared/

Contains

Business Name

Phone Number

Logo

Brand Colors

Hours

License

Insurance

Social Links

Coverage Area

Contact Information

------------------------------------------------------------------------------

# REQUIRED BUSINESS FIELDS

businessName

phone

website

timezone

country

brand

------------------------------------------------------------------------------

# OPTIONAL BUSINESS FIELDS

logo

email

licenses

insurance

certifications

socialLinks

reviewProfiles

callTracking

analytics

------------------------------------------------------------------------------

# SHARED DATASET

Shared datasets contain

States List

Languages

Currencies

Country Codes

Schema Library

Global Settings

These datasets are reusable.

------------------------------------------------------------------------------

# DATASET RELATIONSHIPS

Business

↓

Services

↓

Keywords

↓

Templates

↓

Writer

↓

SEO

↓

Generated Pages

No circular dependencies.

------------------------------------------------------------------------------

# FUTURE COMPATIBILITY

The schema supports

Unlimited Services

Unlimited Keywords

Unlimited FAQs

Unlimited Templates

Unlimited Businesses

without modifying

the Engine.

------------------------------------------------------------------------------

# VALIDATION

Every dataset validates

↓

Schema

↓

Required Fields

↓

Relationships

↓

Duplicates

↓

Runtime

↓

Ready

------------------------------------------------------------------------------

# FINAL PRINCIPLE

Services define WHAT the business offers.

Keywords define WHAT users search.

FAQs define WHAT users ask.

Templates define HOW pages are structured.

Business data defines WHO the company is.

The AI combines these datasets.

The engine remains unchanged.

# ============================================================================
# END OF JSON_SCHEMA
# PART 3
# ============================================================================

# ============================================================================
# JSON SCHEMA
# PART 4
# KNOWLEDGE OBJECT
# CONTEXT PACKET
# CACHE
# REPORTS
# ============================================================================

# PURPOSE

Raw datasets are never used directly by runtime modules.

The engine transforms them into standardized runtime objects.

These runtime objects are temporary.

They are recreated whenever necessary.

Raw datasets remain untouched.

------------------------------------------------------------------------------

# KNOWLEDGE OBJECT

Every validated city becomes exactly one Knowledge Object.

Knowledge Objects are runtime objects.

They are never stored inside

src/data/

------------------------------------------------------------------------------

# KNOWLEDGE OBJECT STRUCTURE

Every Knowledge Object contains

Knowledge ID

↓

Location

↓

Relationships

↓

SEO Metadata

↓

Business Context

↓

Service Context

↓

Runtime Context

↓

Internal Links

↓

Cache Metadata

------------------------------------------------------------------------------

# KNOWLEDGE OBJECT RESPONSIBILITIES

Represent

One City

One Service

One Context

Knowledge Objects never represent multiple cities.

------------------------------------------------------------------------------

# REQUIRED KNOWLEDGE FIELDS

knowledgeId

citySlug

stateCode

serviceSlug

location

relationships

seo

runtime

------------------------------------------------------------------------------

# OPTIONAL KNOWLEDGE FIELDS

weather

traffic

searchConsole

analytics

performance

ranking

cache

------------------------------------------------------------------------------

# KNOWLEDGE RULES

Knowledge Objects

↓

Generated

↓

Validated

↓

Cached

↓

Destroyed

Never edited manually.

------------------------------------------------------------------------------

# CONTEXT PACKET

The AI never receives Knowledge Objects directly.

The Context Engine transforms

Knowledge

↓

Business

↓

Service

↓

Keywords

↓

Entities

↓

Weather

↓

Maps

↓

Internal Links

↓

Prompt Context

↓

Context Packet

------------------------------------------------------------------------------

# CONTEXT PACKET STRUCTURE

Every packet contains

Project

Business

Location

Service

SEO

Entities

Runtime

Prompt Rules

Output Rules

Nothing else.

------------------------------------------------------------------------------

# CONTEXT SIZE

Context must remain minimal.

Never include

Entire State

Entire Country

Entire Dataset

Only

Current Page Context

------------------------------------------------------------------------------

# PROMPT OBJECT

Prompt Objects contain

System Rules

Writing Rules

Business Rules

SEO Rules

Output Rules

Validation Rules

AI receives Prompt Object

+

Context Packet

Only.

------------------------------------------------------------------------------

# SEO OBJECT

Generated for every page.

Contains

Title

Description

Canonical

OpenGraph

Twitter

Schema

Breadcrumb

Robots

Internal Links

Alternate URLs

------------------------------------------------------------------------------

# SEO RULES

Every SEO Object

↓

One Page

Never shared.

Never duplicated.

------------------------------------------------------------------------------

# CACHE OBJECT

Every cache entry contains

Cache ID

↓

Source

↓

Created

↓

Updated

↓

Version

↓

Dependencies

↓

Checksum

------------------------------------------------------------------------------

# CACHE TYPES

Knowledge Cache

↓

Context Cache

↓

Prompt Cache

↓

SEO Cache

↓

Navigation Cache

↓

Relationship Cache

↓

Runtime Cache

Each cache independent.

------------------------------------------------------------------------------

# CACHE INVALIDATION

When

City Changes

↓

Only

Knowledge Cache

↓

Context Cache

↓

SEO Cache

↓

Generated Page

↓

Internal Links

↓

Deploy

Everything else remains unchanged.

------------------------------------------------------------------------------

# BUILD REPORT

Every build generates

Build ID

Start Time

End Time

Duration

Pages Generated

Pages Updated

Warnings

Errors

Deployment Status

------------------------------------------------------------------------------

# VALIDATION REPORT

Contains

Dataset Status

Validation Errors

Warnings

Missing Fields

Broken Relationships

Duplicate Slugs

Duplicate ZIP Codes

Knowledge Status

Runtime Status

------------------------------------------------------------------------------

# ERROR OBJECT

Every error contains

Error ID

Severity

Module

Dataset

Record

Field

Message

Suggested Fix

Timestamp

No anonymous errors.

------------------------------------------------------------------------------

# DASHBOARD OBJECT

Dashboard receives

Projects

↓

Pages

↓

Knowledge

↓

Builds

↓

Errors

↓

Analytics

↓

Search Console

↓

Revenue

↓

Calls

↓

Performance

Dashboard never reads raw datasets.

------------------------------------------------------------------------------

# SEARCH CONSOLE OBJECT

Stores

Property

Coverage

Indexing

Queries

Clicks

CTR

Impressions

Excluded Pages

Errors

Never stores credentials.

------------------------------------------------------------------------------

# ANALYTICS OBJECT

Stores

Visitors

Sessions

Conversions

Calls

Traffic Sources

Landing Pages

Revenue

Top Cities

Top Services

------------------------------------------------------------------------------

# FUTURE AI PROVIDERS

The runtime objects must remain compatible with

ChatGPT

Gemini

Claude

Codex

Qwen

DeepSeek

GLM

Future AI providers.

AI Providers should consume

Context Packets

without changing object structures.

------------------------------------------------------------------------------

# SERIALIZATION

Every runtime object

must be serializable.

Never store

Functions

Class Instances

DOM Objects

Streams

inside runtime JSON.

------------------------------------------------------------------------------

# IMMUTABILITY

Runtime objects

may change.

Raw datasets

may not.

------------------------------------------------------------------------------

# FINAL PRINCIPLE

Raw datasets represent reality.

Knowledge Objects represent understanding.

Context Packets represent reasoning.

Prompt Objects represent instructions.

SEO Objects represent optimization.

Generated Pages represent the final user experience.

# ============================================================================
# END OF JSON_SCHEMA
# PART 4
# ============================================================================

# ============================================================================
# JSON SCHEMA
# PART 5
# COMPATIBILITY
# VERSIONING
# DEPENDENCIES
# ============================================================================

# PURPOSE

This chapter defines long-term compatibility rules.

The Enterprise PSEO Engine must remain stable for years.

Schemas evolve.

The engine evolves.

User datasets remain protected.

------------------------------------------------------------------------------

# SCHEMA OWNERSHIP

Each schema has exactly one owner.

State Schema

↓

Geographic Engine

City Schema

↓

Knowledge Engine

Service Schema

↓

Service Engine

Keyword Schema

↓

Research Engine

FAQ Schema

↓

Content Engine

Template Schema

↓

Writer Engine

Business Schema

↓

Configuration Engine

------------------------------------------------------------------------------

# MODULE DEPENDENCY MATRIX

State Schema

↓

Knowledge Engine

↓

Relationship Builder

↓

Context Engine

City Schema

↓

Knowledge Engine

↓

Writer

↓

Internal Linking

↓

Map Engine

↓

Weather Engine

Service Schema

↓

Writer

↓

SEO

↓

Prompt Builder

Keyword Schema

↓

Research

↓

SEO

↓

Prompt Builder

FAQ Schema

↓

Writer

↓

Schema Generator

Template Schema

↓

Writer

↓

Generator

------------------------------------------------------------------------------

# IMPACT MATRIX

If

State Schema changes

↓

Knowledge Graph

↓

Relationship Builder

↓

Context Engine

↓

Generator

↓

Dashboard

Affected

Critical

--------------

If

City Schema changes

↓

Knowledge Graph

↓

Writer

↓

SEO

↓

Internal Links

↓

Weather

↓

Maps

Affected

Critical

--------------

If

Service Schema changes

↓

Writer

↓

SEO

↓

CTA

↓

Prompt Builder

Affected

High

--------------

If

Keyword Schema changes

↓

Research

↓

SEO

↓

Prompt Builder

Affected

Medium

--------------

If

FAQ Schema changes

↓

Writer

↓

Schema

Affected

Low

------------------------------------------------------------------------------

# SCHEMA VERSIONING

Every schema contains

schemaVersion

engineVersion

minimumEngineVersion

datasetVersion

createdAt

updatedAt

compatibleUntil

------------------------------------------------------------------------------

# COMPATIBILITY RULES

Backward Compatible

↓

Always

Forward Compatible

↓

Preferred

Breaking Changes

↓

Avoid

Removing fields

↓

Forbidden

Renaming fields

↓

Forbidden

Changing data types

↓

Forbidden

------------------------------------------------------------------------------

# DEPRECATION POLICY

Fields are never removed immediately.

Deprecated fields

↓

Warning

↓

Migration

↓

Removal (future major version only)

Never silently remove fields.

------------------------------------------------------------------------------

# MIGRATION

Migration Pipeline

Old Schema

↓

Migration Rules

↓

Validation

↓

Compatibility Check

↓

Runtime Object

↓

Ready

Raw JSON is never modified.

------------------------------------------------------------------------------

# VALIDATION MATRIX

Syntax

↓

Schema

↓

Relationships

↓

Knowledge

↓

SEO

↓

Runtime

↓

Ready

Every level must pass.

------------------------------------------------------------------------------

# FAILURE SEVERITY

INFO

↓

No action required.

WARNING

↓

Build continues.

ERROR

↓

Current module stops.

FATAL

↓

Entire build stops.

------------------------------------------------------------------------------

# DATA CONTRACT

The following contracts are permanent.

State Contract

City Contract

Service Contract

Keyword Contract

FAQ Contract

Template Contract

Business Contract

Runtime Contract

AI Contract

Generator Contract

Dashboard Contract

------------------------------------------------------------------------------

# AI CONTRACT

Every AI Provider

(ChatGPT)

(Gemini)

(Claude)

(Codex)

(Qwen)

(DeepSeek)

(GLM)

must consume

exactly the same

Context Packet.

No provider specific schemas.

------------------------------------------------------------------------------

# PROVIDER ABSTRACTION

AI Providers

↓

Adapter Layer

↓

Prompt Builder

↓

Context Packet

↓

Writer

The engine never depends on one AI.

------------------------------------------------------------------------------

# FUTURE DATASETS

Future datasets

must follow

the same conventions.

Examples

Reviews

Testimonials

Pricing

Promotions

Images

Videos

Blog Articles

Local Events

News

------------------------------------------------------------------------------

# FUTURE COUNTRIES

Future

Canada

Australia

United Kingdom

Germany

France

Europe

must require

datasets only.

The engine architecture remains identical.

------------------------------------------------------------------------------

# FUTURE NICHES

Future

HVAC

Roofing

Flooring

Electrician

Locksmith

Garage Doors

Dentists

Lawyers

must require

only

new datasets.

Never engine modifications.

------------------------------------------------------------------------------

# FUTURE AI

Future AI Providers

must be added through

Adapters.

Never modify

Knowledge Engine

Writer

Generator

Dashboard

------------------------------------------------------------------------------

# STABILITY GUARANTEE

Schemas

↓

Stable

Modules

↓

Replaceable

Providers

↓

Replaceable

Datasets

↓

Expandable

Architecture

↓

Frozen

------------------------------------------------------------------------------

# FINAL ENTERPRISE CONTRACT

The JSON Schemas define the language spoken by every module.

Every module

must respect

these contracts.

The engine must adapt to the schemas.

The schemas must never adapt to implementation details.

Raw datasets belong to the user.

Knowledge belongs to the engine.

Language belongs to AI.

Generated pages belong to the business.

Never violate these principles.

# ============================================================================
# END OF JSON_SCHEMA.md
# VERSION 2.0
# STATUS : COMPLETE
# ============================================================================