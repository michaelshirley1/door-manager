using System.Text.Json.Serialization;
using BusinessApi.Factories;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.WithOrigins("http://localhost:5173", "https://localhost:5173")
              .AllowAnyMethod()
              .AllowAnyHeader());
});

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new()
    {
        Title   = "Door API",
        Version = "v1",
        Description = "REST API exposing Job, Invoice, Order, Quote, Customer and hardware type resources."
    });
});

builder.Services.AddScoped<ICustomerFactory,    CustomerFactory>();
builder.Services.AddScoped<IJobFactory,         JobFactory>();
builder.Services.AddScoped<IInvoiceFactory,     InvoiceFactory>();
builder.Services.AddScoped<IOrderFactory,       OrderFactory>();
builder.Services.AddScoped<IQuoteFactory,       QuoteFactory>();
builder.Services.AddScoped<IDoorTypeFactory,         DoorTypeFactory>();
builder.Services.AddScoped<IHandleTypeFactory,       HandleTypeFactory>();
builder.Services.AddScoped<IHingeTypeFactory,        HingeTypeFactory>();
builder.Services.AddScoped<ICavitySliderTypeFactory, CavitySliderTypeFactory>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "Business API v1"));
}

app.UseHttpsRedirection();
app.UseCors();
app.UseAuthorization();
app.MapControllers();

app.Run();
