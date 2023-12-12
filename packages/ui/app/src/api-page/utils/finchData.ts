import { FinchProviderMatrix } from "../../mdx/components/FinchProviderMatrix";

export const FinchData: FinchProviderMatrix.Data = {
    integrations: {
        adp_workforce_now: {
            name: "ADP Workforce Now",
            organization: "automated",
            payroll: "automated",
            deductions: "assisted",
            iconPath: "/finch/adp.png",
            supportedAccessTypes: ["credentials"],
        },
        alphastaff: {
            name: "AlphaStaff",
            organization: "automated",
            payroll: "automated",
            deductions: "upon_request",
            iconPath: "/finch/alphastaff.png",
            supportedAccessTypes: ["credentials", "api"],
        },
        bamboo_hr: {
            name: "BambooHR",
            organization: "automated",
            payroll: "upon_request",
            deductions: "assisted",
            iconPath: "/finch/bamboohr.png",
            supportedAccessTypes: ["credentials"],
        },
        bob: {
            name: "HiBob",
            organization: "automated",
            payroll: "upon_request",
            deductions: "n/a",
            iconPath: "/finch/hibob.png",
            supportedAccessTypes: ["credentials", "api"],
        },
        deel: {
            name: "Deel",
            organization: "automated",
            payroll: "upon_request",
            deductions: "upon_request",
            iconPath: "/finch/deel.png",

            supportedAccessTypes: ["credentials", "api"],
        },
        gusto: {
            name: "Gusto",
            organization: "automated",
            payroll: "automated",
            deductions: "automated",
            iconPath: "/finch/gusto.png",
            supportedAccessTypes: ["credentials", "api"],
        },
    },
    organization: {
        name: "Organization",
        objects: {
            company: [
                {
                    key: "id",
                    integrations: {
                        adp_workforce_now: ["credentials"],
                        alphastaff: ["api"],
                        bamboo_hr: ["credentials"],
                        bob: ["credentials", "api"],
                    },
                },
                {
                    key: "legal_name",
                    integrations: {
                        adp_workforce_now: ["credentials"],
                        alphastaff: ["api"],
                        bamboo_hr: ["credentials"],
                    },
                },
                {
                    key: "entity.type",
                    integrations: {
                        adp_workforce_now: ["credentials"],
                        alphastaff: ["api"],
                        bamboo_hr: ["credentials"],
                    },
                },
                {
                    key: "entity.subtype",
                    integrations: {
                        adp_workforce_now: ["credentials"],
                        bamboo_hr: ["credentials"],
                    },
                },
                {
                    key: "primary_email",
                    integrations: {
                        adp_workforce_now: ["credentials"],
                        alphastaff: ["api"],
                        bamboo_hr: ["credentials"],
                    },
                },
                {
                    key: "primary_phone_number",
                    integrations: {
                        adp_workforce_now: ["credentials"],
                        alphastaff: ["api"],
                        bamboo_hr: ["credentials"],
                    },
                },
                {
                    key: "ein",
                    integrations: {
                        adp_workforce_now: ["credentials"],
                        alphastaff: ["api"],
                        bamboo_hr: ["credentials"],
                    },
                },
                {
                    key: "departments[].name",
                    integrations: {
                        adp_workforce_now: ["credentials"],
                        alphastaff: ["api"],
                        bamboo_hr: ["credentials"],
                    },
                },
                {
                    key: "departments[].parent",
                    integrations: {
                        adp_workforce_now: ["credentials"],
                        bamboo_hr: ["credentials"],
                    },
                },
                {
                    key: "departments[].parent.name",
                    integrations: {
                        adp_workforce_now: ["credentials"],
                        bamboo_hr: ["credentials"],
                    },
                },
                {
                    key: "locations[].line1",
                    integrations: {
                        alphastaff: ["api"],
                        bamboo_hr: ["credentials"],
                    },
                },
                {
                    key: "locations[].line2",
                    integrations: {
                        alphastaff: ["api"],
                        bamboo_hr: ["credentials"],
                    },
                },
                {
                    key: "locations[].city",
                    integrations: {
                        alphastaff: ["api"],
                        bamboo_hr: ["credentials"],
                    },
                },
                {
                    key: "locations[].state",
                    integrations: {
                        alphastaff: ["api"],
                        bamboo_hr: ["credentials"],
                    },
                },
                {
                    key: "locations[].postal_code",
                    integrations: {
                        alphastaff: ["api"],
                        bamboo_hr: ["credentials"],
                    },
                },
                {
                    key: "locations[].country",
                    integrations: {
                        bamboo_hr: ["credentials"],
                    },
                },
                {
                    key: "accounts[].routing_number",
                    integrations: {
                        alphastaff: ["api"],
                        bamboo_hr: ["credentials"],
                    },
                },
                {
                    key: "accounts[].account_name",
                    integrations: {
                        bamboo_hr: ["credentials"],
                    },
                },
                {
                    key: "accounts[].institution_name",
                    integrations: {
                        bamboo_hr: ["credentials"],
                    },
                },
                {
                    key: "accounts[].account_type",
                    integrations: {
                        alphastaff: ["api"],
                        bamboo_hr: ["credentials"],
                    },
                },
                {
                    key: "accounts[].account_number",
                    integrations: {
                        alphastaff: ["api"],
                        bamboo_hr: ["credentials"],
                    },
                },
            ],
            directory: [
                {
                    key: "individuals[].id",
                    integrations: {
                        adp_workforce_now: ["credentials"],
                        alphastaff: ["api"],
                        bamboo_hr: ["credentials", "api"],
                        bob: ["credentials", "api"],
                    },
                },
                {
                    key: "individuals[].first_name",
                    integrations: {
                        adp_workforce_now: ["credentials"],
                        alphastaff: ["api"],
                        bamboo_hr: ["credentials", "api"],
                        bob: ["credentials", "api"],
                    },
                },
                {
                    key: "individuals[].middle_name",
                    integrations: {
                        adp_workforce_now: ["credentials"],
                        alphastaff: ["api"],
                        bamboo_hr: ["credentials", "api"],
                        bob: ["credentials", "api"],
                    },
                },
                {
                    key: "individuals[].last_name",
                    integrations: {
                        adp_workforce_now: ["credentials"],
                        alphastaff: ["api"],
                        bamboo_hr: ["credentials", "api"],
                        bob: ["credentials", "api"],
                    },
                },
                {
                    key: "individuals[].manager.id",
                    integrations: {
                        adp_workforce_now: ["credentials"],
                        alphastaff: ["api"],
                        bamboo_hr: ["credentials", "api"],
                        bob: ["credentials", "api"],
                    },
                },
                {
                    key: "individuals[].department.name",
                    integrations: {
                        adp_workforce_now: ["credentials"],
                        alphastaff: ["api"],
                        bamboo_hr: ["credentials", "api"],
                        bob: ["credentials", "api"],
                    },
                },
                {
                    key: "individuals[].is_active",
                    integrations: {
                        adp_workforce_now: ["credentials"],
                        alphastaff: ["api"],
                        bamboo_hr: ["credentials", "api"],
                        bob: ["credentials", "api"],
                    },
                },
            ],
            individual: [
                {
                    key: "responses[].body.id",
                    integrations: {
                        adp_workforce_now: ["credentials"],
                        alphastaff: ["api"],
                        bamboo_hr: ["credentials", "api"],
                        bob: ["credentials", "api"],
                    },
                },
                {
                    key: "responses[].body.first_name",
                    integrations: {
                        adp_workforce_now: ["credentials"],
                        alphastaff: ["api"],
                        bamboo_hr: ["credentials", "api"],
                        bob: ["credentials", "api"],
                    },
                },
                {
                    key: "responses[].body.middle_name",
                    integrations: {
                        adp_workforce_now: ["credentials"],
                        alphastaff: ["api"],
                        bamboo_hr: ["credentials", "api"],
                        bob: ["credentials", "api"],
                    },
                },
                {
                    key: "responses[].body.last_name",
                    integrations: {
                        adp_workforce_now: ["credentials"],
                        alphastaff: ["api"],
                        bamboo_hr: ["credentials", "api"],
                        bob: ["credentials", "api"],
                    },
                },
                {
                    key: "responses[].body.preferred_name",
                    integrations: {
                        adp_workforce_now: ["credentials"],
                        bamboo_hr: ["credentials", "api"],
                        bob: ["credentials", "api"],
                    },
                },
                {
                    key: "responses[].body.emails[].data",
                    integrations: {
                        adp_workforce_now: ["credentials"],
                        alphastaff: ["api"],
                        bamboo_hr: ["credentials", "api"],
                        bob: ["credentials", "api"],
                    },
                },
                {
                    key: "responses[].body.emails[].type",
                    integrations: {
                        adp_workforce_now: ["credentials"],
                        alphastaff: ["api"],
                        bamboo_hr: ["credentials", "api"],
                        bob: ["credentials", "api"],
                    },
                },
                {
                    key: "responses[].body.phone_numbers[].data",
                    integrations: {
                        adp_workforce_now: ["credentials"],
                        alphastaff: ["api"],
                        bamboo_hr: ["credentials", "api"],
                        bob: ["credentials", "api"],
                    },
                },
                {
                    key: "responses[].body.phone_numbers[].type",
                    integrations: {
                        adp_workforce_now: ["credentials"],
                        alphastaff: ["api"],
                        bamboo_hr: ["credentials", "api"],
                        bob: ["credentials", "api"],
                    },
                },
                {
                    key: "responses[].body.dob",
                    integrations: {
                        adp_workforce_now: ["credentials"],
                        alphastaff: ["api"],
                        bamboo_hr: ["credentials", "api"],
                        bob: ["credentials", "api"],
                    },
                },
                {
                    key: "responses[].body.residence.line1",
                    integrations: {
                        adp_workforce_now: ["credentials"],
                        alphastaff: ["api"],
                        bamboo_hr: ["credentials", "api"],
                        bob: ["credentials", "api"],
                    },
                },
                {
                    key: "responses[].body.residence.line2",
                    integrations: {
                        adp_workforce_now: ["credentials"],
                        alphastaff: ["api"],
                        bamboo_hr: ["credentials", "api"],
                        bob: ["credentials", "api"],
                    },
                },
                {
                    key: "responses[].body.residence.city",
                    integrations: {
                        adp_workforce_now: ["credentials"],
                        alphastaff: ["api"],
                        bamboo_hr: ["credentials", "api"],
                        bob: ["credentials", "api"],
                    },
                },
                {
                    key: "responses[].body.residence.state",
                    integrations: {
                        adp_workforce_now: ["credentials"],
                        alphastaff: ["api"],
                        bamboo_hr: ["credentials", "api"],
                        bob: ["credentials", "api"],
                    },
                },
                {
                    key: "responses[].body.residence.postal_code",
                    integrations: {
                        adp_workforce_now: ["credentials"],
                        alphastaff: ["api"],
                        bamboo_hr: ["credentials", "api"],
                        bob: ["credentials", "api"],
                    },
                },
                {
                    key: "responses[].body.residence.country",
                    integrations: {
                        adp_workforce_now: ["credentials"],
                        bamboo_hr: ["credentials", "api"],
                        bob: ["credentials", "api"],
                    },
                },
                {
                    key: "responses[].body.gender",
                    integrations: {
                        adp_workforce_now: ["credentials"],
                        alphastaff: ["api"],
                        bamboo_hr: ["credentials", "api"],
                        bob: ["credentials", "api"],
                    },
                },
                {
                    key: "responses[].body.ethnicity",
                    integrations: {
                        adp_workforce_now: ["credentials"],
                        alphastaff: ["api"],
                        bamboo_hr: ["api"],
                        bob: ["credentials", "api"],
                    },
                },
                {
                    key: "responses[].body.ssn",
                    integrations: {
                        adp_workforce_now: ["credentials"],
                        alphastaff: ["api"],
                        bamboo_hr: ["credentials", "api"],
                        bob: ["credentials", "api"],
                    },
                },
                {
                    key: "responses[].body.encrypted_ssn",
                    integrations: {},
                },
            ],
            employment: [
                {
                    key: "id",
                    integrations: {
                        adp_workforce_now: ["credentials"],
                        alphastaff: ["api"],
                        bamboo_hr: ["credentials", "api"],
                        bob: ["credentials", "api"],
                    },
                },
                {
                    key: "source_id",
                    integrations: {
                        adp_workforce_now: ["credentials"],
                        alphastaff: ["api"],
                        bamboo_hr: ["credentials", "api"],
                        bob: ["credentials", "api"],
                    },
                },
                {
                    key: "first_name",
                    integrations: {
                        adp_workforce_now: ["credentials"],
                        alphastaff: ["api"],
                        bamboo_hr: ["credentials", "api"],
                        bob: ["credentials", "api"],
                    },
                },
                {
                    key: "middle_name",
                    integrations: {
                        adp_workforce_now: ["credentials"],
                        alphastaff: ["api"],
                        bamboo_hr: ["credentials", "api"],
                        bob: ["credentials", "api"],
                    },
                },
                {
                    key: "last_name",
                    integrations: {
                        adp_workforce_now: ["credentials"],
                        alphastaff: ["api"],
                        bamboo_hr: ["credentials", "api"],
                        bob: ["credentials", "api"],
                    },
                },
                {
                    key: "title",
                    integrations: {
                        adp_workforce_now: ["credentials"],
                        bamboo_hr: ["credentials", "api"],
                        bob: ["credentials", "api"],
                    },
                },
                {
                    key: "manager.id",
                    integrations: {
                        adp_workforce_now: ["credentials"],
                        alphastaff: ["api"],
                        bamboo_hr: ["credentials", "api"],
                        bob: ["credentials", "api"],
                    },
                },
                {
                    key: "department.name",
                    integrations: {
                        adp_workforce_now: ["credentials"],
                        alphastaff: ["api"],
                        bamboo_hr: ["credentials", "api"],
                        bob: ["credentials", "api"],
                    },
                },
                {
                    key: "employment.type",
                    integrations: {
                        adp_workforce_now: ["credentials"],
                        alphastaff: ["api"],
                        bamboo_hr: ["credentials", "api"],
                        bob: ["credentials", "api"],
                    },
                },
                {
                    key: "employment.subtype",
                    integrations: {
                        adp_workforce_now: ["credentials"],
                        alphastaff: ["api"],
                        bamboo_hr: ["credentials", "api"],
                        bob: ["credentials", "api"],
                    },
                },
                {
                    key: "start_date",
                    integrations: {
                        adp_workforce_now: ["credentials"],
                        alphastaff: ["api"],
                        bamboo_hr: ["credentials", "api"],
                        bob: ["credentials", "api"],
                    },
                },
                {
                    key: "end_date",
                    integrations: {
                        adp_workforce_now: ["credentials"],
                        alphastaff: ["api"],
                        bamboo_hr: ["credentials", "api"],
                        bob: ["credentials", "api"],
                    },
                },
                {
                    key: "is_active",
                    integrations: {
                        adp_workforce_now: ["credentials"],
                        alphastaff: ["api"],
                        bamboo_hr: ["credentials", "api"],
                        bob: ["credentials", "api"],
                    },
                },
                {
                    key: "location.line1",
                    integrations: {
                        adp_workforce_now: ["credentials"],
                        alphastaff: ["api"],
                        bamboo_hr: ["credentials"],
                        bob: ["credentials", "api"],
                    },
                },
                {
                    key: "location.line2",
                    integrations: {
                        adp_workforce_now: ["credentials"],
                        alphastaff: ["api"],
                        bamboo_hr: ["credentials"],
                        bob: ["credentials", "api"],
                    },
                },
                {
                    key: "location.city",
                    integrations: {
                        adp_workforce_now: ["credentials"],
                        alphastaff: ["api"],
                        bamboo_hr: ["credentials"],
                        bob: ["credentials", "api"],
                    },
                },
                {
                    key: "location.state",
                    integrations: {
                        adp_workforce_now: ["credentials"],
                        alphastaff: ["api"],
                        bamboo_hr: ["credentials"],
                        bob: ["credentials", "api"],
                    },
                },
                {
                    key: "location.postal_code",
                    integrations: {
                        adp_workforce_now: ["credentials"],
                        alphastaff: ["api"],
                        bamboo_hr: ["credentials"],
                        bob: ["credentials", "api"],
                    },
                },
                {
                    key: "location.country",
                    integrations: {
                        adp_workforce_now: ["credentials"],
                        bamboo_hr: ["credentials"],
                        bob: ["credentials", "api"],
                    },
                },
                {
                    key: "income.unit",
                    integrations: {
                        adp_workforce_now: ["credentials"],
                        alphastaff: ["api"],
                        bamboo_hr: ["credentials", "api"],
                        bob: ["credentials", "api"],
                    },
                },
                {
                    key: "income.amount",
                    integrations: {
                        adp_workforce_now: ["credentials"],
                        alphastaff: ["api"],
                        bamboo_hr: ["credentials", "api"],
                        bob: ["credentials", "api"],
                    },
                },
                {
                    key: "income.currency",
                    integrations: {
                        adp_workforce_now: ["credentials"],
                        bamboo_hr: ["credentials", "api"],
                        bob: ["credentials", "api"],
                    },
                },
                {
                    key: "income_history",
                    integrations: {
                        adp_workforce_now: ["credentials"],
                        alphastaff: ["api"],
                        bamboo_hr: ["credentials", "api"],
                    },
                },
                {
                    key: "class_code",
                    integrations: {
                        adp_workforce_now: ["credentials"],
                    },
                },
                {
                    key: "custom_fields",
                    integrations: {
                        adp_workforce_now: ["credentials"],
                        bamboo_hr: ["api"],
                        bob: ["credentials", "api"],
                    },
                },
            ],
        },
    },
    payroll: {
        name: "Payroll",
        objects: {
            payment: [
                {
                    key: "id",
                    integrations: {
                        adp_workforce_now: ["credentials"],
                        alphastaff: ["credentials"],
                    },
                },
                {
                    key: "pay_period.start_date",
                    integrations: {
                        adp_workforce_now: ["credentials"],
                        alphastaff: ["credentials"],
                    },
                },
                {
                    key: "pay_period.end_date",
                    integrations: {
                        adp_workforce_now: ["credentials"],
                        alphastaff: ["credentials"],
                    },
                },
                {
                    key: "pay_date",
                    integrations: {
                        adp_workforce_now: ["credentials"],
                        alphastaff: ["credentials"],
                    },
                },
                {
                    key: "debit_date",
                    integrations: {
                        alphastaff: ["credentials"],
                    },
                },
                {
                    key: "company_debit",
                    integrations: {},
                },
                {
                    key: "gross_pay",
                    integrations: {
                        adp_workforce_now: ["credentials"],
                        alphastaff: ["credentials"],
                    },
                },
                {
                    key: "net_pay",
                    integrations: {
                        adp_workforce_now: ["credentials"],
                        alphastaff: ["credentials"],
                    },
                },
                {
                    key: "employer_taxes",
                    integrations: {
                        alphastaff: ["credentials"],
                    },
                },
                {
                    key: "employee_taxes",
                    integrations: {
                        adp_workforce_now: ["credentials"],
                        alphastaff: ["credentials"],
                    },
                },
                {
                    key: "individual_ids",
                    integrations: {
                        adp_workforce_now: ["credentials"],
                        alphastaff: ["credentials"],
                    },
                },
            ],
            "pay-statement": [
                {
                    key: "responses[].body.pay_statements[].individual_id",
                    integrations: {
                        adp_workforce_now: ["credentials"],
                        alphastaff: ["credentials"],
                    },
                },
                {
                    key: "responses[].body.pay_statements[].type",
                    integrations: {
                        adp_workforce_now: ["credentials"],
                        alphastaff: ["credentials"],
                    },
                },
                {
                    key: "responses[].body.pay_statements[].payment_method",
                    integrations: {
                        adp_workforce_now: ["credentials"],
                    },
                },
                {
                    key: "responses[].body.pay_statements[].total_hours",
                    integrations: {
                        adp_workforce_now: ["credentials"],
                        alphastaff: ["credentials"],
                    },
                },
                {
                    key: "responses[].body.pay_statements[].gross_pay",
                    integrations: {
                        adp_workforce_now: ["credentials"],
                        alphastaff: ["credentials"],
                    },
                },
                {
                    key: "responses[].body.pay_statements[].net_pay",
                    integrations: {
                        adp_workforce_now: ["credentials"],
                        alphastaff: ["credentials"],
                    },
                },
                {
                    key: "responses[].body.pay_statements[].earnings[].type",
                    integrations: {
                        adp_workforce_now: ["credentials"],
                        alphastaff: ["credentials"],
                    },
                },
                {
                    key: "responses[].body.pay_statements[].earnings[].name",
                    integrations: {
                        adp_workforce_now: ["credentials"],
                        alphastaff: ["credentials"],
                    },
                },
                {
                    key: "responses[].body.pay_statements[].earnings[].amount",
                    integrations: {
                        adp_workforce_now: ["credentials"],
                        alphastaff: ["credentials"],
                    },
                },
                {
                    key: "responses[].body.pay_statements[].earnings[].currency",
                    integrations: {
                        adp_workforce_now: ["credentials"],
                        alphastaff: ["credentials"],
                    },
                },
                {
                    key: "responses[].body.pay_statements[].earnings[].hours",
                    integrations: {
                        adp_workforce_now: ["credentials"],
                        alphastaff: ["credentials"],
                    },
                },
                {
                    key: "responses[].body.pay_statements[].taxes[].type",
                    integrations: {
                        adp_workforce_now: ["credentials"],
                        alphastaff: ["credentials"],
                    },
                },
                {
                    key: "responses[].body.pay_statements[].taxes[].name",
                    integrations: {
                        adp_workforce_now: ["credentials"],
                        alphastaff: ["credentials"],
                    },
                },
                {
                    key: "responses[].body.pay_statements[].taxes[].amount",
                    integrations: {
                        adp_workforce_now: ["credentials"],
                        alphastaff: ["credentials"],
                    },
                },
                {
                    key: "responses[].body.pay_statements[].taxes[].currency",
                    integrations: {
                        adp_workforce_now: ["credentials"],
                        alphastaff: ["credentials"],
                    },
                },
                {
                    key: "responses[].body.pay_statements[].employee_deductions[].type",
                    integrations: {
                        adp_workforce_now: ["credentials"],
                        alphastaff: ["credentials"],
                    },
                },
                {
                    key: "responses[].body.pay_statements[].employee_deductions[].name",
                    integrations: {
                        adp_workforce_now: ["credentials"],
                        alphastaff: ["credentials"],
                    },
                },
                {
                    key: "responses[].body.pay_statements[].employee_deductions[].amount",
                    integrations: {
                        adp_workforce_now: ["credentials"],
                        alphastaff: ["credentials"],
                    },
                },
                {
                    key: "responses[].body.pay_statements[].employee_deductions[].currency",
                    integrations: {
                        adp_workforce_now: ["credentials"],
                        alphastaff: ["credentials"],
                    },
                },
                {
                    key: "responses[].body.pay_statements[].employee_deductions[].pre_tax",
                    integrations: {
                        adp_workforce_now: ["credentials"],
                    },
                },
                {
                    key: "responses[].body.pay_statements[].employer_contributions[].type",
                    integrations: {
                        adp_workforce_now: ["credentials"],
                        alphastaff: ["credentials"],
                    },
                },
                {
                    key: "responses[].body.pay_statements[].employer_contributions[].name",
                    integrations: {
                        adp_workforce_now: ["credentials"],
                        alphastaff: ["credentials"],
                    },
                },
                {
                    key: "responses[].body.pay_statements[].employer_contributions[].amount",
                    integrations: {
                        adp_workforce_now: ["credentials"],
                        alphastaff: ["credentials"],
                    },
                },
                {
                    key: "responses[].body.pay_statements[].employer_contributions[].currency",
                    integrations: {
                        adp_workforce_now: ["credentials"],
                        alphastaff: ["credentials"],
                    },
                },
            ],
        },
    },
    deductions: {
        benefits: [
            {
                name: "401(k)",
                operations: {
                    read_company_benefits: {
                        adp_workforce_now: "not_supported",
                        bamboo_hr: "not_supported",
                    },
                    create_company_benefits: {
                        adp_workforce_now: "supported",
                        bamboo_hr: "supported",
                    },
                    read_individual_benefits: {
                        adp_workforce_now: "not_supported",
                        bamboo_hr: "not_supported",
                    },
                    enroll_individual_benefits: {
                        adp_workforce_now: "supported",
                        bamboo_hr: "supported",
                    },
                },
                features: {
                    company_contribution: {
                        bamboo_hr: ["fixed", "percent"],
                    },
                    employee_deduction: {
                        adp_workforce_now: ["fixed", "percent"],
                        bamboo_hr: ["fixed", "percent"],
                    },
                    catch_up: {
                        adp_workforce_now: true,
                    },
                    annual_max: {
                        adp_workforce_now: true,
                    },
                },
            },
            {
                name: "Roth 401(k)",
                operations: {
                    read_company_benefits: {
                        adp_workforce_now: "not_supported",
                        bamboo_hr: "not_supported",
                    },
                    create_company_benefits: {
                        adp_workforce_now: "supported",
                        bamboo_hr: "supported",
                    },
                    read_individual_benefits: {
                        adp_workforce_now: "not_supported",
                        bamboo_hr: "not_supported",
                    },
                    enroll_individual_benefits: {
                        adp_workforce_now: "supported",
                        bamboo_hr: "supported",
                    },
                },
                features: {
                    company_contribution: {
                        bamboo_hr: ["fixed", "percent"],
                    },
                    employee_deduction: {
                        adp_workforce_now: ["fixed", "percent"],
                        bamboo_hr: ["fixed", "percent"],
                    },
                    catch_up: {
                        adp_workforce_now: true,
                    },
                    annual_max: {
                        adp_workforce_now: true,
                    },
                },
            },
            {
                name: "401(k) Loan",
                operations: {
                    read_company_benefits: {
                        adp_workforce_now: "not_supported",
                        bamboo_hr: "not_supported",
                    },
                    create_company_benefits: {
                        adp_workforce_now: "supported",
                        bamboo_hr: "supported",
                    },
                    read_individual_benefits: {
                        adp_workforce_now: "not_supported",
                        bamboo_hr: "not_supported",
                    },
                    enroll_individual_benefits: {
                        adp_workforce_now: "supported",
                        bamboo_hr: "supported",
                    },
                },
                features: {
                    company_contribution: {
                        bamboo_hr: ["fixed", "percent"],
                    },
                    employee_deduction: {
                        adp_workforce_now: ["fixed", "percent"],
                        bamboo_hr: ["fixed", "percent"],
                    },
                },
            },
            {
                name: "403(b)",
                operations: {
                    read_company_benefits: {
                        adp_workforce_now: "not_supported",
                        bamboo_hr: "not_supported",
                    },
                    create_company_benefits: {
                        adp_workforce_now: "supported",
                        bamboo_hr: "supported",
                    },
                    read_individual_benefits: {
                        adp_workforce_now: "not_supported",
                        bamboo_hr: "not_supported",
                    },
                    enroll_individual_benefits: {
                        adp_workforce_now: "supported",
                        bamboo_hr: "supported",
                    },
                },
                features: {
                    company_contribution: {
                        bamboo_hr: ["fixed", "percent"],
                    },
                    employee_deduction: {
                        adp_workforce_now: ["fixed", "percent"],
                        bamboo_hr: ["fixed", "percent"],
                    },
                    catch_up: {
                        adp_workforce_now: true,
                    },
                    annual_max: {
                        adp_workforce_now: true,
                    },
                },
            },
            {
                name: "Roth 403(b)",
                operations: {
                    read_company_benefits: {
                        adp_workforce_now: "not_supported",
                        bamboo_hr: "not_supported",
                    },
                    create_company_benefits: {
                        adp_workforce_now: "supported",
                        bamboo_hr: "supported",
                    },
                    read_individual_benefits: {
                        adp_workforce_now: "not_supported",
                        bamboo_hr: "not_supported",
                    },
                    enroll_individual_benefits: {
                        adp_workforce_now: "supported",
                        bamboo_hr: "supported",
                    },
                },
                features: {
                    company_contribution: {
                        bamboo_hr: ["fixed", "percent"],
                    },
                    employee_deduction: {
                        adp_workforce_now: ["fixed", "percent"],
                        bamboo_hr: ["fixed", "percent"],
                    },
                },
            },
            {
                name: "457",
                operations: {
                    read_company_benefits: {
                        adp_workforce_now: "not_supported",
                        bamboo_hr: "not_supported",
                    },
                    create_company_benefits: {
                        adp_workforce_now: "supported",
                        bamboo_hr: "supported",
                    },
                    read_individual_benefits: {
                        adp_workforce_now: "not_supported",
                        bamboo_hr: "not_supported",
                    },
                    enroll_individual_benefits: {
                        adp_workforce_now: "supported",
                        bamboo_hr: "supported",
                    },
                },
                features: {
                    company_contribution: {
                        bamboo_hr: ["fixed", "percent"],
                    },
                    employee_deduction: {
                        adp_workforce_now: ["fixed", "percent"],
                        bamboo_hr: ["fixed", "percent"],
                    },
                    catch_up: {
                        adp_workforce_now: true,
                    },
                    annual_max: {
                        adp_workforce_now: true,
                    },
                },
            },
            {
                name: "Roth 457",
                operations: {
                    read_company_benefits: {
                        adp_workforce_now: "not_supported",
                        bamboo_hr: "not_supported",
                    },
                    create_company_benefits: {
                        adp_workforce_now: "supported",
                        bamboo_hr: "supported",
                    },
                    read_individual_benefits: {
                        adp_workforce_now: "not_supported",
                        bamboo_hr: "not_supported",
                    },
                    enroll_individual_benefits: {
                        adp_workforce_now: "supported",
                        bamboo_hr: "supported",
                    },
                },
                features: {
                    company_contribution: {
                        bamboo_hr: ["fixed", "percent"],
                    },
                    employee_deduction: {
                        adp_workforce_now: ["fixed", "percent"],
                        bamboo_hr: ["fixed", "percent"],
                    },
                    catch_up: {
                        adp_workforce_now: true,
                    },
                    annual_max: {
                        adp_workforce_now: true,
                    },
                },
            },
            {
                name: "Simple IRA",
                operations: {
                    read_company_benefits: {
                        adp_workforce_now: "not_supported",
                        bamboo_hr: "not_supported",
                    },
                    create_company_benefits: {
                        adp_workforce_now: "supported",
                        bamboo_hr: "supported",
                    },
                    read_individual_benefits: {
                        adp_workforce_now: "not_supported",
                        bamboo_hr: "not_supported",
                    },
                    enroll_individual_benefits: {
                        adp_workforce_now: "supported",
                        bamboo_hr: "supported",
                    },
                },
                features: {
                    company_contribution: {
                        bamboo_hr: ["fixed", "percent"],
                    },
                    employee_deduction: {
                        adp_workforce_now: ["fixed", "percent"],
                        bamboo_hr: ["fixed", "percent"],
                    },
                    catch_up: {
                        adp_workforce_now: true,
                    },
                    annual_max: {
                        adp_workforce_now: true,
                    },
                },
            },
            {
                name: "HSA (post-tax)",
                operations: {
                    read_company_benefits: {
                        adp_workforce_now: "not_supported",
                        bamboo_hr: "not_supported",
                    },
                    create_company_benefits: {
                        adp_workforce_now: "supported",
                        bamboo_hr: "supported",
                    },
                    read_individual_benefits: {
                        adp_workforce_now: "not_supported",
                        bamboo_hr: "not_supported",
                    },
                    enroll_individual_benefits: {
                        adp_workforce_now: "supported",
                        bamboo_hr: "supported",
                    },
                },
                features: {
                    company_contribution: {
                        bamboo_hr: ["fixed", "percent"],
                    },
                    employee_deduction: {
                        adp_workforce_now: ["fixed", "percent"],
                        bamboo_hr: ["fixed", "percent"],
                    },
                    hsa_contribution_limit: {
                        adp_workforce_now: ["individual", "family"],
                    },
                },
            },
            {
                name: "HSA (pre-tax)",
                operations: {
                    read_company_benefits: {
                        adp_workforce_now: "not_supported",
                        bamboo_hr: "not_supported",
                    },
                    create_company_benefits: {
                        adp_workforce_now: "supported",
                        bamboo_hr: "supported",
                    },
                    read_individual_benefits: {
                        adp_workforce_now: "not_supported",
                        bamboo_hr: "not_supported",
                    },
                    enroll_individual_benefits: {
                        adp_workforce_now: "supported",
                        bamboo_hr: "supported",
                    },
                },
                features: {
                    company_contribution: {
                        bamboo_hr: ["fixed", "percent"],
                    },
                    employee_deduction: {
                        adp_workforce_now: ["fixed", "percent"],
                        bamboo_hr: ["fixed", "percent"],
                    },
                    hsa_contribution_limit: {
                        adp_workforce_now: ["individual", "family"],
                    },
                },
            },
            {
                name: "FSA Dependent",
                operations: {
                    read_company_benefits: {
                        adp_workforce_now: "not_supported",
                        bamboo_hr: "not_supported",
                    },
                    create_company_benefits: {
                        adp_workforce_now: "supported",
                        bamboo_hr: "supported",
                    },
                    read_individual_benefits: {
                        adp_workforce_now: "not_supported",
                        bamboo_hr: "not_supported",
                    },
                    enroll_individual_benefits: {
                        adp_workforce_now: "supported",
                        bamboo_hr: "supported",
                    },
                },
                features: {
                    company_contribution: {
                        bamboo_hr: ["fixed", "percent"],
                    },
                    employee_deduction: {
                        adp_workforce_now: ["fixed", "percent"],
                        bamboo_hr: ["fixed", "percent"],
                    },
                },
            },
            {
                name: "FSA Medical",
                operations: {
                    read_company_benefits: {
                        adp_workforce_now: "not_supported",
                        bamboo_hr: "not_supported",
                    },
                    create_company_benefits: {
                        adp_workforce_now: "supported",
                        bamboo_hr: "supported",
                    },
                    read_individual_benefits: {
                        adp_workforce_now: "not_supported",
                        bamboo_hr: "not_supported",
                    },
                    enroll_individual_benefits: {
                        adp_workforce_now: "supported",
                        bamboo_hr: "supported",
                    },
                },
                features: {
                    company_contribution: {
                        bamboo_hr: ["fixed", "percent"],
                    },
                    employee_deduction: {
                        adp_workforce_now: ["fixed", "percent"],
                        bamboo_hr: ["fixed", "percent"],
                    },
                },
            },
            {
                name: "Section 125 Dental",
                operations: {
                    read_company_benefits: {
                        adp_workforce_now: "not_supported",
                        bamboo_hr: "not_supported",
                    },
                    create_company_benefits: {
                        adp_workforce_now: "supported",
                        bamboo_hr: "supported",
                    },
                    read_individual_benefits: {
                        adp_workforce_now: "not_supported",
                        bamboo_hr: "not_supported",
                    },
                    enroll_individual_benefits: {
                        adp_workforce_now: "supported",
                        bamboo_hr: "supported",
                    },
                },
                features: {
                    company_contribution: {
                        bamboo_hr: ["fixed", "percent"],
                    },
                    employee_deduction: {
                        adp_workforce_now: ["fixed", "percent"],
                        bamboo_hr: ["fixed", "percent"],
                    },
                },
            },
            {
                name: "Section 125 Medical",
                operations: {
                    read_company_benefits: {
                        adp_workforce_now: "not_supported",
                        bamboo_hr: "not_supported",
                    },
                    create_company_benefits: {
                        adp_workforce_now: "supported",
                        bamboo_hr: "supported",
                    },
                    read_individual_benefits: {
                        adp_workforce_now: "not_supported",
                        bamboo_hr: "not_supported",
                    },
                    enroll_individual_benefits: {
                        adp_workforce_now: "supported",
                        bamboo_hr: "supported",
                    },
                },
                features: {
                    company_contribution: {
                        bamboo_hr: ["fixed", "percent"],
                    },
                    employee_deduction: {
                        adp_workforce_now: ["fixed", "percent"],
                        bamboo_hr: ["fixed", "percent"],
                    },
                },
            },
            {
                name: "Section 125 Vision",
                operations: {
                    read_company_benefits: {
                        adp_workforce_now: "not_supported",
                        bamboo_hr: "not_supported",
                    },
                    create_company_benefits: {
                        adp_workforce_now: "supported",
                        bamboo_hr: "supported",
                    },
                    read_individual_benefits: {
                        adp_workforce_now: "not_supported",
                        bamboo_hr: "not_supported",
                    },
                    enroll_individual_benefits: {
                        adp_workforce_now: "supported",
                        bamboo_hr: "supported",
                    },
                },
                features: {
                    company_contribution: {
                        bamboo_hr: ["fixed", "percent"],
                    },
                    employee_deduction: {
                        adp_workforce_now: ["fixed", "percent"],
                        bamboo_hr: ["fixed", "percent"],
                    },
                },
            },
            {
                name: "Commuter (pre-tax)",
                operations: {
                    read_company_benefits: {
                        adp_workforce_now: "not_supported",
                        bamboo_hr: "not_supported",
                    },
                    create_company_benefits: {
                        adp_workforce_now: "supported",
                        bamboo_hr: "supported",
                    },
                    read_individual_benefits: {
                        adp_workforce_now: "not_supported",
                        bamboo_hr: "not_supported",
                    },
                    enroll_individual_benefits: {
                        adp_workforce_now: "supported",
                        bamboo_hr: "supported",
                    },
                },
                features: {
                    company_contribution: {
                        bamboo_hr: ["fixed", "percent"],
                    },
                    employee_deduction: {
                        adp_workforce_now: ["fixed", "percent"],
                        bamboo_hr: ["fixed", "percent"],
                    },
                },
            },
            {
                name: "Custom pre-tax",
                operations: {
                    read_company_benefits: {
                        adp_workforce_now: "not_supported",
                    },
                    create_company_benefits: {
                        adp_workforce_now: "supported",
                    },
                    read_individual_benefits: {
                        adp_workforce_now: "not_supported",
                    },
                    enroll_individual_benefits: {
                        adp_workforce_now: "supported",
                    },
                },
                features: {
                    company_contribution: {
                        bamboo_hr: ["fixed", "percent"],
                    },
                    employee_deduction: {
                        adp_workforce_now: ["fixed", "percent"],
                        bamboo_hr: ["fixed", "percent"],
                    },
                },
            },
            {
                name: "Custom post-tax",
                operations: {
                    read_company_benefits: {
                        adp_workforce_now: "not_supported",
                        bamboo_hr: "not_supported",
                    },
                    create_company_benefits: {
                        adp_workforce_now: "supported",
                        bamboo_hr: "supported",
                    },
                    read_individual_benefits: {
                        adp_workforce_now: "not_supported",
                        bamboo_hr: "not_supported",
                    },
                    enroll_individual_benefits: {
                        adp_workforce_now: "supported",
                        bamboo_hr: "supported",
                    },
                },
                features: {
                    company_contribution: {
                        bamboo_hr: ["fixed", "percent"],
                    },
                    employee_deduction: {
                        adp_workforce_now: ["fixed", "percent"],
                        bamboo_hr: ["fixed", "percent"],
                    },
                },
            },
        ],
    },
};
