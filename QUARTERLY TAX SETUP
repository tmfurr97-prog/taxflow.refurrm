# Quarterly Estimated Tax Payment System

## Features

1. **Tax Calculator**: Calculates quarterly estimated tax payments based on annual income and expenses
2. **Payment Tracking**: Tracks all 4 quarterly payments for the current year
3. **Automated Reminders**: Sends email reminders 14 days before payment deadlines
4. **Payment History**: View and manage payment status for each quarter

## Quarterly Deadlines

- **Q1** (Jan 1 - Mar 31): Due April 15
- **Q2** (Apr 1 - May 31): Due June 15
- **Q3** (Jun 1 - Aug 31): Due September 15
- **Q4** (Sep 1 - Dec 31): Due January 15 (next year)

## Setup Automated Reminders

The system includes a Supabase Edge Function `send-quarterly-tax-reminders` that should be triggered daily.

### Using Supabase Cron (Recommended)

Add this to your Supabase project settings:

```sql
SELECT cron.schedule(
  'send-quarterly-tax-reminders',
  '0 9 * * *', -- Run daily at 9 AM UTC
  $$
  SELECT net.http_post(
    url:='https://your-project.supabase.co/functions/v1/send-quarterly-tax-reminders',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
  ) as request_id;
  $$
);
```

### Using External Cron Service

Alternatively, use services like:
- GitHub Actions (free)
- Vercel Cron Jobs
- AWS EventBridge
- Google Cloud Scheduler

Example GitHub Actions workflow:

```yaml
name: Quarterly Tax Reminders
on:
  schedule:
    - cron: '0 9 * * *'
jobs:
  send-reminders:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Reminder Function
        run: |
          curl -X POST https://your-project.supabase.co/functions/v1/send-quarterly-tax-reminders \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_ANON_KEY }}"
```

## Database Schema

The system uses the `estimated_tax_payments` table with these fields:
- `user_id`: Reference to auth.users
- `year`: Tax year
- `quarter`: Quarter number (1-4)
- `due_date`: Payment deadline
- `estimated_amount`: Calculated quarterly amount
- `paid_amount`: Amount actually paid
- `paid_date`: Date payment was made
- `reminder_sent`: Whether reminder email was sent

## Usage

1. Navigate to the "Quarterly Taxes" section
2. Enter your annual income and expenses in the calculator
3. Click "Calculate Estimated Tax" to see quarterly amounts
4. Payment records are automatically created for the current year
5. Mark payments as paid when completed
6. Receive email reminders 14 days before each deadline

## Email Configuration

Ensure SendGrid API key is configured in Supabase secrets:
- Secret name: `SENDGRID_API_KEY`
- Used by: `send-quarterly-tax-reminders` edge function
