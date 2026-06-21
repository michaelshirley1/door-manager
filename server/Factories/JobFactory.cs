using BusinessApi.Models;

namespace BusinessApi.Factories
{
    public interface IJobFactory
    {
        IEnumerable<Job> GetAll();
        Job? GetById(int id);
        Job Create(Job job);
        Job? Update(int id, Job job);
        bool Delete(int id);
    }

    public class JobFactory : IJobFactory
    {
        private static int _nextId = 4;

        private static readonly List<Job> _jobs =
        [
            new Job
            {
                Id = 1,
                JobNumber = "JOB-001",
                CustomerId = 1,
                CustomerName = "John Smith",
                PurchaseOrderId = 1,
                Status = "InProgress",
                SiteAddress = "15 Industry Rd, Auckland",
                SiteDescription = "Replace all interior doors on levels 1 and 2.",
                AssignedTo = "Tom Baker",
                ScheduledDate = new DateOnly(2026, 4, 28),
                Notes = "Client requested brushed nickel hardware throughout.",
                CreatedAt = new DateTime(2026, 4, 1, 0, 0, 0, DateTimeKind.Utc),
                UpdatedAt = new DateTime(2026, 4, 28, 0, 0, 0, DateTimeKind.Utc),
                Items =
                [
                    new OrderItem
                    {
                        Id = 1,
                        JobId = 1,
                        ItemType = "Door",
                        DoorTypeId = 1,
                        Room = "Office 1",
                        HeightMm = 2040,
                        WidthMm = 820,
                        ThicknessMm = 40,
                        HandSide = "Left",
                        Drilling = true,
                        ColourFinish = "White",
                        Quantity = 2,
                        UnitPrice = 650.00m,
                        SortOrder = 1,
                        CreatedAt = new DateTime(2026, 4, 1, 0, 0, 0, DateTimeKind.Utc),
                    },
                    new OrderItem
                    {
                        Id = 2,
                        JobId = 1,
                        ItemType = "Handle",
                        HandleTypeId = 1,
                        Quantity = 2,
                        UnitPrice = 85.00m,
                        SortOrder = 2,
                        CreatedAt = new DateTime(2026, 4, 1, 0, 0, 0, DateTimeKind.Utc),
                    },
                ],
            },
            new Job
            {
                Id = 2,
                JobNumber = "JOB-002",
                CustomerId = 2,
                CustomerName = "Sarah Johnson",
                PurchaseOrderId = 2,
                Status = "Scheduled",
                SiteAddress = "42 Commerce St, Wellington",
                SiteDescription = "Install new fire doors in stairwells.",
                AssignedTo = "Dave Wilson",
                ScheduledDate = new DateOnly(2026, 5, 10),
                Notes = "All doors must be FRR rated. Confirm with building inspector before install.",
                CreatedAt = new DateTime(2026, 4, 15, 0, 0, 0, DateTimeKind.Utc),
                UpdatedAt = new DateTime(2026, 4, 15, 0, 0, 0, DateTimeKind.Utc),
                Items =
                [
                    new OrderItem
                    {
                        Id = 3,
                        JobId = 2,
                        ItemType = "Door",
                        DoorTypeId = 3,
                        Room = "Stairwell A",
                        HeightMm = 2100,
                        WidthMm = 900,
                        ThicknessMm = 45,
                        HandSide = "Right",
                        Drilling = false,
                        FireRating = "FRR 60/60/60",
                        Quantity = 3,
                        UnitPrice = 1200.00m,
                        SortOrder = 1,
                        CreatedAt = new DateTime(2026, 4, 15, 0, 0, 0, DateTimeKind.Utc),
                    },
                ],
            },
            new Job
            {
                Id = 3,
                JobNumber = "JOB-003",
                CustomerId = 3,
                CustomerName = "Mike Williams",
                PurchaseOrderId = 3,
                Status = "Completed",
                SiteAddress = "88 Builder Ave, Christchurch",
                SiteDescription = "Full door package for new commercial build.",
                AssignedTo = "Tom Baker",
                ScheduledDate = new DateOnly(2026, 3, 1),
                CompletedDate = new DateOnly(2026, 4, 15),
                Notes = "All items installed and signed off by site manager.",
                CreatedAt = new DateTime(2026, 2, 20, 0, 0, 0, DateTimeKind.Utc),
                UpdatedAt = new DateTime(2026, 4, 15, 0, 0, 0, DateTimeKind.Utc),
                Items =
                [
                    new OrderItem
                    {
                        Id = 4,
                        JobId = 3,
                        ItemType = "Door",
                        DoorTypeId = 2,
                        Room = "Reception",
                        HeightMm = 2400,
                        WidthMm = 1200,
                        ThicknessMm = 40,
                        HandSide = "Right",
                        Drilling = true,
                        ColourFinish = "Primed",
                        Glazing = "Clear 6mm",
                        Quantity = 1,
                        UnitPrice = 1800.00m,
                        SortOrder = 1,
                        CreatedAt = new DateTime(2026, 2, 20, 0, 0, 0, DateTimeKind.Utc),
                    },
                    new OrderItem
                    {
                        Id = 5,
                        JobId = 3,
                        ItemType = "Freight",
                        Quantity = 1,
                        UnitPrice = 350.00m,
                        Notes = "Delivery to site",
                        SortOrder = 2,
                        CreatedAt = new DateTime(2026, 2, 20, 0, 0, 0, DateTimeKind.Utc),
                    },
                ],
            },
        ];

        public IEnumerable<Job> GetAll() => _jobs;

        public Job? GetById(int id) =>
            _jobs.FirstOrDefault(j => j.Id == id);

        public Job Create(Job job)
        {
            job.Id = _nextId++;
            job.CreatedAt = DateTime.UtcNow;
            job.UpdatedAt = DateTime.UtcNow;
            _jobs.Add(job);
            return job;
        }

        public Job? Update(int id, Job job)
        {
            var existing = _jobs.FirstOrDefault(j => j.Id == id);
            if (existing is null) return null;

            existing.JobNumber = job.JobNumber;
            existing.CustomerId = job.CustomerId;
            existing.CustomerName = job.CustomerName;
            existing.PurchaseOrderId = job.PurchaseOrderId;
            existing.Status = job.Status;
            existing.SiteAddress = job.SiteAddress;
            existing.SiteDescription = job.SiteDescription;
            existing.AssignedTo = job.AssignedTo;
            existing.ScheduledDate = job.ScheduledDate;
            existing.CompletedDate = job.CompletedDate;
            existing.Notes = job.Notes;
            existing.UpdatedAt = DateTime.UtcNow;
            return existing;
        }

        public bool Delete(int id)
        {
            var existing = _jobs.FirstOrDefault(j => j.Id == id);
            if (existing is null) return false;
            _jobs.Remove(existing);
            return true;
        }
    }
}
