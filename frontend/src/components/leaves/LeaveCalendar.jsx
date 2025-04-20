import React, { useState } from 'react';
import '../../styles/CalendarStyles.css';

const LeaveCalendar = ({ leaves, approvedLeaves }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  // Calendar navigation functions
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  // Calendar helper functions
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { month: 'numeric', day: 'numeric', year: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Render calendar
  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);

    // Create array for days of the week
    const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    // Create array for calendar days
    const calendarDays = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      calendarDays.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);

      // Check if there are any leaves on this day
      const leavesOnDay = leaves.filter(leave => {
        const leaveDate = new Date(leave.startDate);
        return (
          leaveDate.getDate() === day &&
          leaveDate.getMonth() === month &&
          leaveDate.getFullYear() === year &&
          leave.status === 'Approved'
        );
      });

      const hasLeaves = leavesOnDay.length > 0;
      const isSelected = selectedDate && selectedDate.toDateString() === date.toDateString();

      calendarDays.push(
        <div
          key={`day-${day}`}
          className={`calendar-day ${hasLeaves ? 'has-leaves' : ''} ${isSelected ? 'selected' : ''}`}
          onClick={() => setSelectedDate(date)}
        >
          {day}
          {hasLeaves && <div className="leave-indicator">{leavesOnDay.length}</div>}
        </div>
      );
    }

    return (
      <div className="calendar-days-container">
        <div className="calendar-days-header">
          {daysOfWeek.map((day, index) => (
            <div key={index} className="day-name">{day}</div>
          ))}
        </div>
        <div className="calendar-days">
          {calendarDays}
        </div>
      </div>
    );
  };

  // Render approved leaves list
  const renderApprovedLeaves = () => {
    if (!approvedLeaves || approvedLeaves.length === 0) {
      return <div className="no-approved-leaves">No approved leaves</div>;
    }

    return (
      <div className="approved-leaves-list">
        {approvedLeaves.map(leave => (
          <div key={leave._id} className="approved-leave-item">
            <div className="employee-avatar">
              <img
                src={`http://localhost:5000/api/profile/picture/default-avatar.jpg`}
                alt={leave.employee?.fullName}
              />
            </div>
            <div className="leave-details">
              <div className="employee-name">{leave.employee?.fullName || 'Employee'}</div>
              <div className="employee-position">{leave.employee?.position || 'Position'}</div>
            </div>
            <div className="leave-date">
              {formatDate(leave.startDate)}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="leave-calendar-section">
      <div className="calendar-header">
        <h3>Leave Calendar</h3>
      </div>

      <div className="calendar-month-display">
        <button className="calendar-nav-btn" onClick={prevMonth}>
          &lt;
        </button>
        <div>{currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</div>
        <button className="calendar-nav-btn" onClick={nextMonth}>
          &gt;
        </button>
      </div>

      {renderCalendar()}

      <div className="approved-leaves-section">
        <div className="approved-title">Approved Leaves</div>
        {renderApprovedLeaves()}
      </div>
    </div>
  );
};

export default LeaveCalendar;
