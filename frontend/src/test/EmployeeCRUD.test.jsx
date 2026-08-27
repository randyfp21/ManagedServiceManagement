import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import EmployeePage from '../pages/EmployeePage';
import * as apiModule from '../utils/api';

describe('Frontend Employee Master Data CRUD Flow', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('performs complete CRUD cycle for "dummy employee 2"', async () => {
    let mockEmployees = [
      {
        id_employee: 101,
        employee_name: 'Existing Employee',
        employee_role: 'Developer',
        status: 'Active',
        is_active: true,
        id_group: 1,
        id_customer: 1,
        start_contract: '2026-01-01',
        end_contract: '2026-12-31',
        last_salary_increment_date: '2026-06-01',
        sallary_gross: 10000000,
        tunjangan_penempatan: 1000000,
        tunjangan_keahlian: 500000,
        koefisien: 1.4,
        revenue_nett: 20000000,
      },
    ];

    vi.spyOn(apiModule, 'apiFetch').mockImplementation((endpoint, options = {}) => {
      const method = options.method || 'GET';

      if (endpoint === '/groups') {
        return Promise.resolve({
          success: true,
          data: [{ id_group: 1, group_name: 'AIGEN', brand_name: 'AIGEN' }],
        });
      }

      if (endpoint === '/customers') {
        return Promise.resolve({
          success: true,
          data: [{ id_customer: 1, customer_name: 'Bank BSI' }],
        });
      }

      if (endpoint.startsWith('/employees?')) {
        return Promise.resolve({
          success: true,
          data: {
            employees: mockEmployees,
            total: mockEmployees.length,
            page: 1,
            limit: 10,
            total_pages: 1,
          },
        });
      }

      if (endpoint === '/employees' && method === 'POST') {
        const body = JSON.parse(options.body);
        const newEmp = {
          id_employee: 102,
          ...body,
          group: { id_group: 1, brand_name: 'AIGEN' },
          customer: { id_customer: 1, customer_name: 'Bank BSI' },
        };
        mockEmployees.unshift(newEmp);
        return Promise.resolve({
          success: true,
          message: 'Employee created successfully',
          data: newEmp,
        });
      }

      if (endpoint.startsWith('/employees/') && method === 'PUT') {
        const id = Number(endpoint.split('/')[2]);
        const body = JSON.parse(options.body);
        const index = mockEmployees.findIndex((e) => e.id_employee === id);
        if (index !== -1) {
          mockEmployees[index] = {
            ...mockEmployees[index],
            ...body,
          };
          return Promise.resolve({
            success: true,
            message: 'Employee updated successfully',
            data: mockEmployees[index],
          });
        }
      }

      if (endpoint.startsWith('/employees/') && method === 'DELETE') {
        const id = Number(endpoint.split('/')[2]);
        mockEmployees = mockEmployees.filter((e) => e.id_employee !== id);
        return Promise.resolve({
          success: true,
          message: 'Employee deleted successfully',
        });
      }

      return Promise.reject(new Error(`Unhandled endpoint: ${endpoint}`));
    });

    // 1. READ (Initial Render)
    const { container } = render(
      <BrowserRouter>
        <EmployeePage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Existing Employee')).toBeInTheDocument();
    });

    // 2. CREATE (Add "dummy employee 2")
    const addButton = screen.getByRole('button', { name: /add employee/i });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Tambah Karyawan Baru')).toBeInTheDocument();
    });

    const inputs = container.querySelectorAll('form input');
    // inputs[0] is Name, inputs[1] is Role, inputs[4] is Last Salary Increment Date
    fireEvent.change(inputs[0], { target: { value: 'dummy employee 2' } });
    fireEvent.change(inputs[1], { target: { value: 'Senior QA Engineer' } });

    // Find date input for last salary increment
    const dateInputs = container.querySelectorAll('form input[type="date"]');
    if (dateInputs.length > 0) {
      // Last date input in form is last_salary_increment_date
      fireEvent.change(dateInputs[dateInputs.length - 1], { target: { value: '2026-08-01' } });
    }

    const submitBtn = screen.getByRole('button', { name: /simpan data/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/karyawan baru dummy employee 2 berhasil ditambahkan/i)).toBeInTheDocument();
    });

    // Verify "dummy employee 2" is rendered in table
    await waitFor(() => {
      expect(screen.getByText('dummy employee 2')).toBeInTheDocument();
      expect(screen.getByText('Senior QA Engineer')).toBeInTheDocument();
    });

    // 3. UPDATE (Edit "dummy employee 2")
    window.confirm = vi.fn().mockReturnValue(true);
    const editBtns = screen.getAllByTitle('Edit Data Karyawan');
    fireEvent.click(editBtns[0]);

    await waitFor(() => {
      expect(screen.getByText('Edit Data Karyawan')).toBeInTheDocument();
    });

    const editInputs = container.querySelectorAll('form input');
    fireEvent.change(editInputs[1], { target: { value: 'Lead QA Engineer' } });

    const updateBtn = screen.getByRole('button', { name: /perbarui data/i });
    fireEvent.click(updateBtn);

    await waitFor(() => {
      expect(screen.getByText(/data karyawan dummy employee 2 berhasil diperbarui/i)).toBeInTheDocument();
    });

    // 4. DELETE (Delete "dummy employee 2")
    const deleteBtns = screen.getAllByTitle('Hapus Karyawan');
    fireEvent.click(deleteBtns[0]);

    await waitFor(() => {
      expect(screen.getByText('Hapus Data Karyawan?')).toBeInTheDocument();
    });

    const confirmDeleteBtn = screen.getByRole('button', { name: /hapus permanen/i });
    fireEvent.click(confirmDeleteBtn);

    await waitFor(() => {
      expect(screen.getByText('Karyawan berhasil dihapus dari database.')).toBeInTheDocument();
    });

    // Verify "dummy employee 2" is removed from list
    expect(screen.queryByText('dummy employee 2')).not.toBeInTheDocument();
  });
});
